// import etro from 'etro'


function val (element, path, time) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // if (hasCachedValue(element, path)) {
  //   return getCachedValue(element, path)
  // }
  // Get property of element at path
  const pathParts = path.split('.')
  let property = element[pathParts.shift()]
  while (pathParts.length > 0) {
    property = property[pathParts.shift()]
  }

  // Property filter function
  const process = element.propertyFilters[path]

  let value
  if (property.evaluate) {
    value = property.evaluate(time)
  } else if (typeof property === 'function') {
    value = property(element, time)
  } else {
    // Simple value
    value = property
  }
  return value
  // return cacheValue(element, path, process ? process.call(element, value) : value)
}

export async function make_audio(etro, layer) {
  const audio = new etro.layer.Audio({
    startTime: layer.startTime,
    duration: layer.duration,
    source: layer.audio,
    sourceStartTime: 0, // default: 0
    muted: false, // default: false
    volume: 1, // default: 1
    playbackRate: 1, // default: 1
  });
  return audio
}

export async function make_caption(etro, layer, dim = {width: 1080, height: 1920}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 64
  let maxWidth = 0.8


  let captions = layer.caption.split(" ")
  let dx = 0
  let dy = 0
  captions = captions.map((word, i, arr) => {
    const font = `bold ${fontSize}px sans-serif`
    ctx.font = font

    const isHighlighted = layer.highlights.includes(word)

    let color = isHighlighted ? 'yellow' : 'white'
    
    let textWidth = ctx.measureText(word).width
    if(dx + textWidth > dim.width * maxWidth) {
      dx = 0
      dy += fontSize * 1.5
    }
    let c =  {
      word,
      width: textWidth,
      startTime: 0,
      y: dy,
      x: dx,
      font,
      color
    }
    dx += c.width + fontSize * 0.6
    if(dx > dim.width * maxWidth) {
      dx = 0
      dy += fontSize * 1.5
    }
    return c
  })
  let totalWidth = 0
  for(let i=0; i<captions.length; i++) {
    totalWidth += captions[i].width
  }
  let texts = []
  let dt = 0
  for(let i=0; i<captions.length; i++) {
    let caption = captions[i]
    const text = new etro.layer.Text({
      startTime: layer.startTime + dt,
      duration: layer.duration - dt,
      text: caption.word,
      textX: 0.1 * dim.width + caption.x, // default: 0
      textY: layer.y * dim.height + caption.y, // default: 0
      width: dim.width, // default: null (full width)
      height: dim.height, // default: null (full height)
      font: caption.font, // default: '16px sans-serif'
      color: etro.parseColor(caption.color || 'white'), // default: black
      textAlign: 'left', // default: left
      textBaseline: 'middle', // default: top
      opacity: 1, // default: 1
    });
    texts.push(text)
    dt += caption.width * layer.duration / totalWidth
  }
  return texts
}

export async function make_image(etro, layer, dim = {width: 1080, height: 1920}) {
  let img = await getImageFromUrl(layer.image)

  const l = new etro.layer.Image({
    startTime: layer.startTime,
    duration: layer.duration,
    source: img.image,
    sourceX: 0, // default: 0
    sourceY: 0, // default: 0
    sourceWidth: dim.width, // default: null (full width)
    sourceHeight: dim.height, // default: null (full height)
    x: 0, // default: 0
    y: 0, // default: 0
    // destWidth: bg.width,
    // destHeight: bg.height,
    // width: 600, // default: null (full width)
    // height: 400, // default: null (full height)
    opacity: 1, // default: 1
  });
  const scale = fitOnCanvas({width: dim.width, height: dim.height}, img)

  const f = 1 + 0.1 * layer.duration
  
  const baseScale = new etro.effect.Transform.Matrix().scale(scale.scaleX, scale.scaleY)
  l.addEffect(new etro.effect.Transform({
    matrix: baseScale
  }))

  if(layer.effects && layer.effects.length) {
    for(let j=0; j<layer.effects.length; j++) {
      let _effect = layer.effects[j]
      console.log(12, _effect)
      if(_effect.type === "zoom-in") {
        const baseScale = new etro.effect.Transform.Matrix().scale(1.0, 1.0)
        const baseScale2 = new etro.effect.Transform.Matrix().scale(f, f)
        baseScale2.translate(-dim.width * 0.5 * (f-1), -dim.height * 0.5 * (f-1))

        const keyframe = new etro.KeyFrame(
          [0, baseScale],
          [layer.duration, baseScale2]
        )
        const effect = new etro.effect.Transform({
          matrix: keyframe
        })
        effect.apply = function(target, reltime) {
                if (target.canvas.width !== this._tmpCanvas.width) {
                  this._tmpCanvas.width = target.canvas.width;
                }
                if (target.canvas.height !== this._tmpCanvas.height) {
                  this._tmpCanvas.height = target.canvas.height;
                }
                // console.log(this._tmpMatrix)
                this._tmpMatrix = val(this, "matrix", reltime);
                this._tmpCtx.setTransform(this._tmpMatrix.a, this._tmpMatrix.b, this._tmpMatrix.c, this._tmpMatrix.d, this._tmpMatrix.e, this._tmpMatrix.f);
                this._tmpCtx.drawImage(target.canvas, 0, 0);
                this._tmpCtx.setTransform(1, 0, 0, 0, 1, 0);
                target.cctx.clearRect(0, 0, target.canvas.width, target.canvas.height);
                target.cctx.drawImage(this._tmpCanvas, 0, 0);
        };
        effect.apply.bind(effect)
        
        l.addEffect(effect)
      }
    }
  }

  return l
}

export async function make_video(etro, layer, dim = {width: 1080, height: 1920}) {
  const scale = fitOnCanvas({width: dim.width, height: dim.height}, {
    width: layer.originalWidth,
    height: layer.originalHeight
  })
  layer.scale = layer.scale || 1.0
  scale.scaleX *= layer.scale
  scale.scaleY *= layer.scale
  scale.width *= layer.scale
  scale.height *= layer.scale

  layer.x = layer.x || dim.width * 0.5
  layer.y = layer.y || dim.height * 0.5

  const video_layer = new etro.layer.Video({
    startTime: layer.startTime,
    duration: layer.duration,
    source: layer.src,
    sourceX: 0, // default: 0
    sourceY: 0, // default: 0
    sourceWidth: Math.max(dim.width, layer.originalWidth), // default: null (full width)
    sourceHeight: Math.max(dim.height, layer.originalHeight), // default: null (full height)
    x: layer.x - scale.width * 0.5, // default: 0
    y: layer.y - scale.height * 0.5, // default: 0
    // width: 400, // default: null (full width)
    // height: 400, // default: null (full height)
    opacity: 1, // default: 1
  });
  
  const effect1 = new etro.effect.Transform({
    matrix: new etro.effect.Transform.Matrix()
      .scale(scale.scaleX, scale.scaleY),
  })
  video_layer.addEffect(effect1)

  if(layer.effects && layer.effects.length) {
    for(let j=0; j<layer.effects.length; j++) {
      let _effect = layer.effects[j]
      console.log(12, _effect)
      if(_effect.type === "round") {
        let r = Math.min(scale.width, scale.height) * 0.5
        const effect = new etro.effect.EllipticalMask({
          x: scale.width*.5, // the x-coordinate of the center of the ellipse
          y: scale.height*0.5, // the y-coordinate of the center of the ellipse
          radiusX: r, // the horizontal radius of the ellipse
          radiusY: r, // the vertical radius of the ellipse
          rotation: 0, // rotation angle in radians (default: 0)
          startAngle: 0, // start angle in radians (default: 0)
          endAngle: 2 * Math.PI, // end angle in radians (default: 2 * Math.PI)
          anticlockwise: false, // whether the ellipse is drawn clockwise or anticlockwise (default: false)
        })
        
        video_layer.addEffect(effect)
      }
    }
  }

  return video_layer
}