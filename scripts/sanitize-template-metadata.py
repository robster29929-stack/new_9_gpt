"""Remove author metadata from blank legacy templates; leave Workbook bytes unchanged.
No cell/formula/format edits. Removes BIFF WRITEACCESS identity metadata too. Originals remain in the source Site checkout.
"""
from pathlib import Path
import io, json, struct
import xlrd
from xlrd.compdoc import CompDoc


def stream(data, name):
    return CompDoc(data, logfile=io.StringIO()).get_named_stream(name)

reports = []
for path in Path('dist/assets/forms').glob('*.xls'):
    data = path.read_bytes()
    workbook_before = stream(data, 'Workbook') or stream(data, 'Book')
    metadata = stream(data, '\x05SummaryInformation')
    if not metadata:
        continue
    sections = struct.unpack_from('<I', metadata, 24)[0]
    changed = 0
    for section in range(sections):
        base = struct.unpack_from('<I', metadata, 28 + section * 20 + 16)[0]
        count = struct.unpack_from('<I', metadata, base + 4)[0]
        for i in range(count):
            prop, offset = struct.unpack_from('<II', metadata, base + 8 + i * 8)
            if prop not in (4, 8):
                continue
            start = base + offset
            kind, length = struct.unpack_from('<II', metadata, start)
            if kind not in (30, 31):
                continue
            size = length * (2 if kind == 31 else 1)
            value = metadata[start + 8:start + 8 + size]
            if not value.strip(b'\0'):
                continue
            old = metadata[start:start + 8 + size]
            new = metadata[start:start + 8] + bytes(size)
            if data.count(old) != 1:
                raise ValueError('Non-unique metadata field; no changes made: ' + path.name)
            data = data.replace(old, new, 1)
            changed += 1
    # BIFF embeds an additional last-editor identity in WRITEACCESS (0x005c).
    workbook_after = stream(data, 'Workbook') or stream(data, 'Book')
    normalized_before = bytearray(workbook_before)
    offset = 0
    identities = []
    while offset + 4 <= len(workbook_after):
        record, size = struct.unpack_from('<HH', workbook_after, offset)
        payload = workbook_after[offset + 4:offset + 4 + size]
        if record == 0x005c:
            length = struct.unpack_from('<H', payload, 0)[0]
            wide = payload[2] & 1
            identity = payload[3:3 + length * (2 if wide else 1)]
            if identity.strip(b'\0 '):
                identities.append(identity)
            old_record = workbook_after[offset:offset + 4 + size]
            clean_record = old_record[:4] + bytes(size)
            if data.count(old_record) != 1:
                raise ValueError('Non-unique BIFF identity record: ' + path.name)
            data = data.replace(old_record, clean_record, 1)
            normalized_before[offset + 4:offset + 4 + size] = bytes(size)
        offset += 4 + size
    if (stream(data, 'Workbook') or stream(data, 'Book')) != bytes(normalized_before):
        raise ValueError('Non-metadata Workbook records unexpectedly changed: ' + path.name)
    for identity in identities:
        if identity in data:
            raise ValueError('Identity bytes still present outside metadata: ' + path.name)
    original = xlrd.open_workbook(path)
    cleaned = xlrd.open_workbook(file_contents=data)
    assert original.sheet_names() == cleaned.sheet_names()
    for a, b in zip(original.sheets(), cleaned.sheets()):
        assert a.nrows == b.nrows and a.ncols == b.ncols
        for row in range(a.nrows):
            assert a.row_values(row) == b.row_values(row)
    path.write_bytes(data)
    reports.append({'file': path.name, 'author_fields_cleared': changed, 'non_identity_biff_records_identical': True, 'cell_values_identical': True})
print(json.dumps(reports, ensure_ascii=False, indent=2))

# XLSX: edit only the optional ZIP core-properties part, never worksheet XML.
from zipfile import ZipFile
from xml.etree import ElementTree as E
for path in Path('dist/assets/forms').glob('*.xlsx'):
    with ZipFile(path) as archive:
        entries = [(info, archive.read(info.filename)) for info in archive.infolist()]
    cleaned_entries = []
    changed = 0
    for info, body in entries:
        if info.filename == 'docProps/core.xml':
            root = E.fromstring(body)
            for element in root:
                if element.tag.rsplit('}', 1)[-1] in ('creator', 'lastModifiedBy'):
                    element.text = ''
                    changed += 1
            body = E.tostring(root, encoding='utf-8', xml_declaration=True)
        cleaned_entries.append((info, body))
    output = io.BytesIO()
    with ZipFile(output, 'w') as archive:
        for info, body in cleaned_entries:
            archive.writestr(info, body)
    with ZipFile(io.BytesIO(output.getvalue())) as archive:
        for info, body in entries:
            if info.filename != 'docProps/core.xml':
                assert archive.read(info.filename) == body
    path.write_bytes(output.getvalue())
    print(json.dumps({'file':path.name,'author_fields_cleared':changed,'non_metadata_parts_identical':True},ensure_ascii=False))
