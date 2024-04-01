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
// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
let webcamRunning = false;
let videoHeight;
let videoWidth;

// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
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

// In this demo, we have put all our clickable images in divs with the
// CSS class 'detectionOnClick'. Lets get all the elements that have
// this class.

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

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

let lastVideoTime = -1;
async function predictWebcam() {
  let video = videoEl.value;
  
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    let results = handLandmarker.detectForVideo(video, startTimeMs);
    

    canvasCtx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
    canvasCtx.save();
    
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS);
        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    canvasCtx.restore();

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

    results = faceLandmarker.detectForVideo(video, startTimeMs);
    
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

  // Call this function again to keep predicting when the browser is ready.
  requestAnimationFrame(predictWebcam);
}

onMounted(() => {

  canvasCtx = canvasEl.value.getContext("2d");
  drawingUtils = new DrawingUtils(canvasCtx);
  createPoseLandmarker();
});

</script>
