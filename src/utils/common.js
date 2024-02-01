
import {v4 as uuidv4} from 'uuid';

import QrScanner from 'qr-scanner';
let _windowCopy = {
  addEventListener: ()=>{},
  removeEventListener: ()=>{},
}
if(process.client && typeof window !== 'undefined') {
  _windowCopy = window
}
let _locationCopy = {
  origin: ""
}
if(process.client && typeof location !== 'undefined') {
  _locationCopy = location
}
let _copyNavigator = {
  userAgent: ""
}
if(process.client && typeof navigator !== 'undefined') {
  _copyNavigator = navigator
}
let _localStorageCopy = {
  getItem: ()=>{},
  setItem: ()=>{},
}
if(process.client && typeof localStorage !== 'undefined') {
  _localStorageCopy = localStorage
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const _URL = _windowCopy.URL || _windowCopy.webkitURL || _windowCopy.mozURL || _windowCopy.msURL;

export const getGuestUser = () => {
  // read from localstorage
  let guest_id = localStorage.getItem('qr_guest_id')
  if(!guest_id) {
    guest_id = uuidv4()
    localStorage.setItem('qr_guest_id', guest_id)
  }
  return guest_id
}

// export const waitForUser = ()=>new Promise((resolve, reject) => {
//   console.log(supabase.auth.session())
//     // const auth = getAuth();
//     // onAuthStateChanged(auth, resolve)
// })

export const isMobile = ()=>{
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(_copyNavigator.userAgent)) {
    return true
  } else {
    return false
  }
}
export const currentDevice = ()=>{
  return isMobile()? 'mobile': 'desktop'
}
export const isTouchDevice = ()=>{
  return 'ontouchstart' in _windowCopy || _copyNavigator.maxTouchPoints || _copyNavigator.msMaxTouchPoints > 0;
}

export const isMac = ()=>{
  return _copyNavigator.userAgent.indexOf('Mac OS X') > -1
}

export const downloadImage = async (imageSrc, name="zust-ai") => {
  let link;
  if(typeof imageSrc == 'string') {
    const image = await fetch(imageSrc)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)
    link = document.createElement('a')
    link.href = imageURL
  }else{
    link = imageSrc
  }

  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const sleep = (time) => {
  return new Promise((resolve, reject)=>{
    setTimeout(resolve, time)
  })
}
export const readAsFile = (url, filename) => {
  return new Promise((resolve, reject)=>{
    fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], filename, {type: blob.type})
      resolve(file)
    })
  }
)}

export const readAsDataUrl = (file) => {
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

export function getImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      resolve({
        height: image.height,
        width: image.width,
        url,
        base64Encode: () => base64EncodeImage(image),
        image
      });
    };
    image.onerror = () => reject();
  });
}

export const base64EncodeImage = (image) => {

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("no context found on the canvas");
  }
  ctx.drawImage(image, 0, 0);

  return canvas.toDataURL("image/png");
};

export const getImageDimension = (file) => {
  return new Promise((resolve, reject)=>{
    const img = new Image()
    img.onload = ()=>{
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.src = _URL.createObjectURL(file)
  }
)}

export const readAsImage = (url) => {
  return new Promise((resolve, reject)=>{
    const img = new Image()
    img.onload = ()=>{
      resolve(img)
    }
    img.src = url
  }
)}

export const formatDateTime = (date, version=0) => {
  // format: DD-MM-YYYY HH:mm:ss
  const current_year = new Date().getFullYear()
  const d = new Date(date)
  const year = d.getFullYear().toString().padStart(4, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  const second = d.getSeconds().toString().padStart(2, '0')

  if(version === 1) {
    const year_str = year == current_year? '': `, ${year}`
    return `${MONTHS[d.getMonth()]} ${day}${year_str} at ${hour}:${minute}`
  }
  return `${day}-${month}-${year} ${hour}:${minute}:${second}`
}

export const isAncestor = (parent, child) => {
  let node = child.parentNode
  while(node) {
    if(node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}

export const forceNumeric = (e, def=0) => {
  if(e === '') {
    return 0
  }
  return isNaN(e) ? def : e
}

export const copyJSON = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}
export function toDecimal(num, fixed=2) {
  if(isNaN(num)) return 0
  return Number(num).toFixed(fixed)
}


function transformImage(ctx, img, T) {
  ctx.save();
  ctx.transform(...T);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
function blurImage(ctx, img, radius) {
  ctx.save();
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
export async function scanQR(url, return_bool=false) {
  let count = 0
  const T = 2 * 4 * 4
  try{
    let res = await fetch(url)
    let img_ = await res.blob()
    let img = await readAsDataUrl(img_)

    const texture = await readAsImage(img)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = texture.width * 1.2;
    canvas.height = texture.height * 1.2;
    
    await sleep(100)
    for(let j=3; j<5; j++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      blurImage(ctx, texture, j*0.8);
      await sleep(100) 
      const _img = canvas.toDataURL("image/png");

      const texture2 = await readAsImage(_img)

      for(let m=-3; m<=3; m++) {
        if(Math.abs(m) <= 1) continue
        for(let n=-3; n<=3; n++) {
          if(Math.abs(n) <= 1) continue
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const T = [1, n*0.015, m*0.015, 1, texture.width * 0.1, texture.height * 0.1]
          transformImage(ctx, texture2, T);
          await sleep(100)
          // get the image data from canvas as url
          const __img = canvas.toDataURL("image/png");
          try{
            const res = await QrScanner.scanImage(__img, { returnDetailedScanResult: true })
            if(return_bool) return true
            count ++
          }catch(e){
            // console.log(e)
          }
        }
      }
    }
  }catch(e){
    console.log(e)
  }
  if(return_bool) return false
  return {count, total_test: T}
}

export async function createVideoThumbnail(video_url) {
  const video = document.createElement('video');
  video.src = video_url;
  video.crossOrigin = "anonymous";
  video.muted = true
  video.autoplay = true
  video.loop = true
  video.playsinline = true
  video.controls = true
  video.style.position = 'absolute'
  video.style.top = '0px'
  video.style.left = '0px'
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.objectFit = 'cover'
  video.style.zIndex = '1'
  video.style.opacity = '0'
  video.style.pointerEvents = 'none'
  video.style.visibility = 'hidden'
  video.style.display = 'none'
  document.body.appendChild(video)
  await new Promise((resolve, reject)=>{
    video.onloadeddata = () => {
      resolve()
    }
  })
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const thumbnail = canvas.toDataURL("image/png");
  document.body.removeChild(video)
  return thumbnail
} 

export const windowCopy = _windowCopy
export const locationCopy = _locationCopy
export const copyNavigator = _copyNavigator
export const navigatorCopy = _copyNavigator
export const localStorageCopy = _localStorageCopy