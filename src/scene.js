import * as THREE from 'three';
export function startScene(container){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){container.innerHTML='<div class="fallback-orbit">◎</div>';return;}
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{container.innerHTML='<div class="fallback-orbit">◎</div>';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));container.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.z=7;
 const group=new THREE.Group();scene.add(group);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,1),new THREE.MeshStandardMaterial({color:0x9b85ff,metalness:.65,roughness:.22,flatShading:true}));group.add(core);
 for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.75+i*.15,.012,8,100),new THREE.MeshBasicMaterial({color:i===1?0x65ead3:0xa79bff}));ring.rotation.set(i*.7,.7+i*.5,.3);group.add(ring);}
 scene.add(new THREE.AmbientLight(0xffffff,2));const light=new THREE.PointLight(0xc8bbff,65);light.position.set(3,3,4);scene.add(light);
 let pointerX=0,pointerY=0;container.addEventListener('pointermove',e=>{const r=container.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;});
 const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(container);resize();
 renderer.setAnimationLoop(t=>{if(document.hidden)return;core.rotation.y=t*.00025;core.rotation.x=t*.00012;group.rotation.y=pointerX*.5;group.rotation.x=pointerY*.3;group.position.y=Math.sin(t*.001)*.12;renderer.render(scene,camera);});
}
