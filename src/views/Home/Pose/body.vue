<template>
  <div>
    <h1>Body Pose Detection</h1>
    <div style="position: relative; transform: scaleX(-100%);">
      <video
        ref="videoEl"
        id="video"
        autoplay
        playsinline
        muted></video>
      <canvas
        ref="canvasEl"
        style="position: absolute; z-index: 1; top: 0; left: 0;"></canvas>
    </div>
    <v-btn @click="enableCam" color="primary">Enable Webcam</v-btn>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import {
  PoseLandmarker,
  HandLandmarker,
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";

let poseLandmarker = undefined;
let handLandmarker = undefined;
let faceLandmarker = undefined;
let videoHeight;
let videoWidth;

const states = reactive({
  isDetectingFace: false,
  isDetectingPose: false,
  isDetectingHands: true,
  pointMove: true,
  rectangleMove: false
})

const balls = [{
  id: '0',
  x: 0.5,
  y: 0.5,
  r: 0.1,
}, {
  id: '1',
  x: 0.25,
  y: 0.5,
  r: 0.1,
}, {
  id: '2',
  x: 0.3,
  y: 0.3,
  r: 0.1,
}, {
  id: '3',
  x: 0.2,
  y: 0.3,
  r: 0.1,
}, {
  id: '4',
  x: 0.8,
  y: 0.7,
  r: 0.1,
}]

const rect = [{
  x: 0.2,
  y: 0.2,
}, {
  x: 0.2,
  y: 0.6,
}, {
  x: 0.8,
  y: 0.2,
}, {
  x: 0.8,
  y: 0.6,
}]

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  const runningMode = "VIDEO";
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: 1,
  });
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numHands: 2
  });
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
};

const videoEl = ref("");
const canvasEl = ref("");
let canvasCtx;
let drawingUtils;

// If webcam supported, add event listener to button for when user
// wants to activate it.

let currentLandmarks = [];
for(let i=0; i<33; i++) {
  currentLandmarks.push({x: 0, y: 0, z: 0});
}

// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!poseLandmarker) {
    console.log("Wait! poseLandmaker not loaded yet.");
    return;
  }
  if( !handLandmarker) {
    console.log("Wait! handLandmarker not loaded yet.");
    return;
  }
  if( !faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    videoEl.value.srcObject = stream;
    videoEl.value.addEventListener("loadeddata", ()=>{
      videoHeight = videoEl.value.videoHeight;
      videoWidth = videoEl.value.videoWidth;

      canvasEl.value.width = videoWidth;
      canvasEl.value.height = videoHeight;

      videoEl.value.style.height = '80vh';

      canvasEl.value.style.height = '80vh';


      // canvasEl.value.style.height = videoHeight;
      // canvasEl.value.style.width = videoWidth;
      predictWebcam();
    });
  });
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 );
}

function detectHands(video, startTimeMs) {
  let results = handLandmarker.detectForVideo(video, startTimeMs);
  const selected = []
  if(results.landmarks.length === 0) {
    return [results, selected]
  }
  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      let d = dist(landmarks[4], landmarks[8]) / dist(landmarks[1], landmarks[2]);
      if(d > 1) {
        continue
      }
      selected.push(landmarks);
      // drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS);
      // drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
    }
  }
  return [results, selected]
}

function detectBody(video, startTimeMs) {
  poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
    canvasCtx.save();

    let d = 0.3
    for (const i in result.landmarks) {
      let landmark = result.landmarks[i];
      currentLandmarks = currentLandmarks.map((l, i)=> {
        return {
          x: l.x * (1-d) + landmark[i].x * d,
          y: l.y * (1-d) + landmark[i].y * d,
          z: l.z * (1-d) + landmark[i].z * d,
        }
      });

      drawingUtils.drawLandmarks(currentLandmarks, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
      });
      drawingUtils.drawConnectors(currentLandmarks, PoseLandmarker.POSE_CONNECTIONS);
    }
    canvasCtx.restore();
  });

}

function detectFace(video, startTimeMs) {
  let results = faceLandmarker.detectForVideo(video, startTimeMs);
  
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
  }
}

async function predictWebcam() {
  let video = videoEl.value;
  
  let startTimeMs = performance.now();
  canvasCtx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
  
  let selected = []
  let hands = []
  if(states.isDetectingHands){
    let ret = detectHands(video, startTimeMs);
    selected = ret[1];
    hands = ret[0];
  }
  
  if(states.isDetectingPose){
    detectBody(video, startTimeMs);
  }

  if(states.isDetectingFace){
    detectFace(video, startTimeMs);
  }

  if(states.pointMove) {
    let used = []
    for(let ball of balls) {
      // draw filled circle
      let isSelectedIndex = selected.findIndex((landmarks, i) => {
        let pt = {
          x: (landmarks[4].x + landmarks[8].x) * 0.5,
          y: (landmarks[4].y + landmarks[8].y) * 0.5,
        }
        let d = dist(pt, ball)
        return d < ball.r * 0.4 && !used.includes(i)
      });
      let isSelected = isSelectedIndex !== -1 ? selected[isSelectedIndex] : null;
      if(isSelected) {
        ball.x = (isSelected[4].x + isSelected[8].x) * 0.5;
        ball.y = (isSelected[4].y + isSelected[8].y) * 0.5;
        used.push(isSelectedIndex);
      }
      canvasCtx.beginPath();
      canvasCtx.fillStyle = '#6c5ce7';
      if(isSelected) {
        // stroke
        canvasCtx.arc(
          ball.x * videoWidth,
          ball.y * videoHeight,
          ball.r * videoWidth * 0.4 - 0.02 * videoWidth * 0.5,
          0, 2 * Math.PI);

        canvasCtx.lineWidth = parseInt(0.02 * videoWidth);
        canvasCtx.strokeStyle = '#000000';
        canvasCtx.stroke();

      }else{
        canvasCtx.arc(
          ball.x * videoWidth,
          ball.y * videoHeight,
          ball.r * videoWidth * 0.4,
          0, 2 * Math.PI);
      }
      canvasCtx.fill();
      canvasCtx.closePath();
    }
  }

  // create rectangle line
  if(states.rectangleMove) {
    let rectMap = [{
      start: 0, end: 1
    }, {
      start: 1, end: 3
    }, {
      start: 3, end: 2
    }, {
      start: 2, end: 0
    }]

    let handIndex = 0
    if(hands.landmarks[0]) {
      let ld = hands.landmarks[0]
      if( dist(ld[8], rect[0]) > dist(ld[8], rect[2])) {
        handIndex = 2
      }
      rect[handIndex].x = ld[8].x
      rect[handIndex].y = ld[8].y
      rect[handIndex + 1].x = ld[4].x
      rect[handIndex + 1].y = ld[4].y
    }
    if(hands.landmarks[1]) {
      let ld = hands.landmarks[1]
      handIndex = Math.abs(handIndex - 2)
      rect[handIndex].x = ld[8].x
      rect[handIndex].y = ld[8].y
      rect[handIndex + 1].x = ld[4].x
      rect[handIndex + 1].y = ld[4].y
    }
    drawingUtils.drawConnectors(rect, rectMap, { color: "#00FF00", lineWidth: 2 });
    drawingUtils.drawLandmarks(rect, { color: "#6c5ce7", lineWidth: 2 });
  }


  // Call this function again to keep predicting when the browser is ready.
  requestAnimationFrame(predictWebcam);
}

onMounted(() => {

  canvasCtx = canvasEl.value.getContext("2d");
  drawingUtils = new DrawingUtils(canvasCtx);
  createPoseLandmarker();
});

</script>
