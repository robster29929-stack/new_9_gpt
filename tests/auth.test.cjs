const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('dist/assets/auth.js','utf8');
async function setup(mode, auth, values={}) {
 let listener; const messages={dataset:{}}; const submit={disabled:false}; const redirects=[];
 const form={elements:Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{value}])),querySelector:()=>submit,addEventListener:(_,fn)=>{listener=fn;}};
 const location={origin:'https://portal.example',search:'',pathname:'/reset-password.html',replace:v=>redirects.push(v)};
 await vm.runInNewContext(source,{window:{portalSupabase:{auth}},document:{body:{dataset:{authMode:mode}},getElementById:id=>id==='auth-form'?form:messages},location,history:{replaceState(){}},URLSearchParams});
 return {submit:()=>listener({preventDefault(){}}),messages,redirects,button:submit};
}
test('successful password login redirects to workspace; errors remain on login',async()=>{
 let called;
 const ui=await setup('login',{signInWithPassword:async args=>{called=args;return {error:null};}},{email:' owner@example.test ',password:'long-passphrase'});
 await ui.submit();assert.equal(called.email,'owner@example.test');assert.deepEqual(ui.redirects,['/workspace.html']);
 const denied=await setup('login',{signInWithPassword:async()=>({error:{code:'invalid_credentials'}})},{email:'a@example.test',password:'invalid'});
 await denied.submit();assert.equal(denied.redirects.length,0);assert.equal(denied.messages.dataset.error,'true');
});
test('recovery uses the current origin and never claims actual email delivery',async()=>{
 let called;
 const ui=await setup('forgot',{resetPasswordForEmail:async(...args)=>{called=args;return {error:null};}},{email:'a@example.test'});
 await ui.submit();assert.equal(called[1].redirectTo,'https://portal.example/reset-password.html');
 assert.ok(ui.messages.textContent.startsWith('หากอีเมลนี้มีบัญชี'));
});
test('a reset without a recovery session never updates a password',async()=>{
 let updated=false;
 const ui=await setup('reset',{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),updateUser:async()=>{updated=true;return {error:null};}},{password:'a-very-long-password',confirmPassword:'a-very-long-password'});
 await ui.submit();assert.equal(updated,false);assert.equal(ui.messages.dataset.error,'true');
});
test('a confirmed reset updates the password and signs out before redirect',async()=>{
 const events=[];
 const ui=await setup('reset',{onAuthStateChange(){},getSession:async()=>({data:{session:{user:{id:'test'}}}}),updateUser:async()=>{events.push('update');return {error:null};},signOut:async()=>{events.push('signout');return {error:null};}},{password:'a-very-long-password',confirmPassword:'a-very-long-password'});
 await ui.submit();assert.deepEqual(events,['update','signout']);assert.deepEqual(ui.redirects,['/login.html']);
});
