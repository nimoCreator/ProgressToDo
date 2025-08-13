<template>
    <div class="colorPicker" @click.stop>
        <div class="controls">
            <select v-model="pickerType" class="pickerTypeSelect" @click.stop="updateInputMethod">
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="hex">Hex Input</option>
            </select>
            <button @click="setNull">inherit</button>
            <div class="preview" :style="{ backgroundColor: colorHex }"></div>
        </div>

        <div v-if="pickerType === 'circle'" class="circlePicker">
            <div class="hueWheel" 
                :style="{ 
                    '--saturation': `${Math.round(saturation * 100)}%`, 
                    '--brightness': `${Math.round((brightness * 50)*(1 + ( 1 - saturation) ))}%` 
                    }"
                ref="hueWheel" @mousedown.stop="startDraggingHue" @touchstart.stop="startDraggingHue">

                <div class="huePreview" @click.stop @mousedown.stop @touchstart.stop :style="{ backgroundColor: colorHex }"></div>
                <div class="hueCursor" :style="hueCursorStyle"></div>
            </div>
            <div class="sliders">
                <div class="sliderContainer">
                    <label>Saturation: {{ Math.round(saturation * 100) }}%</label>
                    <input class="gradientBackground" :style="{
                        '--from': `hsl(${Math.round(hue)}, 0%, ${Math.round(brightness * 100)}%)`,
                        '--to': `hsl(${Math.round(hue)}, 100%, ${Math.round(brightness * 50)}%)`,
                        '--color': colorHex 
                    }" type="range" v-model="saturation" min="0" max="1" step="0.01" @click.stop />
                </div>
                <div class="sliderContainer">
                    <label>Brightness: {{ Math.round(brightness * 100) }}%</label>
                    <input class="gradientBackground" :style="{
                        '--from': `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, 0%)`,
                        '--to': `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(100 - saturation * 50)}%)`,
                        '--color': colorHex 
                    }" type="range" v-model="brightness" min="0" max="1" step="0.01" @click.stop />
                </div>
            </div>
        </div>

        <div v-if="pickerType === 'square'" class="squarePicker">
            <div class="colorSquare" ref="colorSquare" @mousedown.stop="startDraggingSquare"
                @touchstart.stop="startDraggingSquare" :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }">
                <div class="squareCursor" :style="squareCursorStyle"></div>
            </div>
            <div class="sliderContainer">
                <label>Hue: {{ Math.round(hue) }}°</label>
                <input :style="{ '--color': `hsl(${Math.round(hue)}, 100%, 50%)` }" class="hueSlider" type="range"
                    v-model="hue" min="0" max="360" step="1" @click.stop />
            </div>
        </div>

        <div class="hexInputContainer">
            <label>Hex:</label>
            <input type="text" v-model="hexInput" @input="updateFromHexInput" placeholder="#RRGGBB" @click.stop />
        </div>
    </div>
</template>

<script>
export default {
    name: 'nimoColorPicker',
    props: {
        modelValue: {
            type: String,
            default: '#00aaff'
        }
    },
    data() {
        return {
            pickerType: 'circle',
            hue: 0,
            saturation: 1,
            brightness: 1,
            hexInput: '#00aaff',
            isDragging: false,
            colorWheelSize: 200,
            resizeObserver: null,
        }
    },
    computed: {
        
        colorHex() {
            return this.hsvToHex(this.hue, this.saturation, this.brightness)
        },
        squareCursorStyle() {
            return {
                left: `${this.saturation * 100}%`,
                top: `${100 - (this.brightness * 100)}%`,
                backgroundColor: this.colorHex
            }
        },
        hueCursorStyle() {

            const angle = this.hue * Math.PI / 180
            const radius = this.colorWheelSize / 2 - 16 // Adjust for cursor size
            const x = Math.sin(angle) * radius + this.colorWheelSize / 2
            const y = -Math.cos(angle) * radius + this.colorWheelSize / 2

            return {
                left: `${x}px`,
                top: `${y}px`,
                backgroundColor: this.colorHex
            }
        },
    },
    watch: {
        colorHex: {
            handler(newVal) {
                this.hexInput = newVal
                this.$emit('update:modelValue', newVal)
            }
        },
        modelValue: {
            immediate: true,
            handler(newVal) {
                if (newVal && newVal !== this.colorHex) {
                    this.updateFromHex(newVal)
                }
            }
        },

    },
    methods: {

        startDraggingHue(event) {
            event.preventDefault()
            this.isDragging = true
            this.updateHueFromEvent(event)

            const moveHandler = (e) => this.updateHueFromEvent(e)
            const stopHandler = () => {
                this.isDragging = false
                document.removeEventListener('mousemove', moveHandler)
                document.removeEventListener('touchmove', moveHandler)
                document.removeEventListener('mouseup', stopHandler)
                document.removeEventListener('touchend', stopHandler)
            }

            document.addEventListener('mousemove', moveHandler)
            document.addEventListener('touchmove', moveHandler)
            document.addEventListener('mouseup', stopHandler)
            document.addEventListener('touchend', stopHandler)
        },

        updateHueFromEvent(event) {
            if (!this.isDragging) return

            const wheelRect = this.$refs.hueWheel.getBoundingClientRect()
            const centerX = wheelRect.width / 2
            const centerY = wheelRect.height / 2

            // Handle both mouse and touch events
            let clientX, clientY
            if (event.touches) {
                clientX = event.touches[0].clientX
                clientY = event.touches[0].clientY
            } else {
                clientX = event.clientX
                clientY = event.clientY
            }

            const x = clientX - wheelRect.left - centerX
            const y = clientY - wheelRect.top - centerY

            // Calculate angle in degrees
            let angle = Math.atan2(y, x) * 180 / Math.PI + 90
            if (angle < 0) angle += 360 // Convert to 0-360 range

            this.hue = angle
        },

        startDraggingSquare(event) {
            event.preventDefault()
            this.isDragging = true
            this.updateSquareFromEvent(event)

            const moveHandler = (e) => this.updateSquareFromEvent(e)
            const stopHandler = () => {
                this.isDragging = false
                document.removeEventListener('mousemove', moveHandler)
                document.removeEventListener('touchmove', moveHandler)
                document.removeEventListener('mouseup', stopHandler)
                document.removeEventListener('touchend', stopHandler)
            }

            document.addEventListener('mousemove', moveHandler)
            document.addEventListener('touchmove', moveHandler)
            document.addEventListener('mouseup', stopHandler)
            document.addEventListener('touchend', stopHandler)
        },

        updateSquareFromEvent(event) {
            if (!this.isDragging) return

            const squareRect = this.$refs.colorSquare.getBoundingClientRect()

            // Handle both mouse and touch events
            let clientX, clientY
            if (event.touches) {
                clientX = event.touches[0].clientX
                clientY = event.touches[0].clientY
            } else {
                clientX = event.clientX
                clientY = event.clientY
            }

            let x = (clientX - squareRect.left) / squareRect.width
            let y = (clientY - squareRect.top) / squareRect.height

            // Clamp values between 0 and 1
            x = Math.max(0, Math.min(1, x))
            y = Math.max(0, Math.min(1, y))

            this.saturation = x
            this.brightness = 1 - y
        },

        updateFromHexInput() {
            // Add # if missing
            if (this.hexInput.charAt(0) !== '#') {
                this.hexInput = '#' + this.hexInput
            }

            // Validate hex format
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
            if (hexRegex.test(this.hexInput)) {
                this.updateFromHex(this.hexInput)
            }
        },

        updateFromHex(hex) {
            const rgb = this.hexToRgb(hex)
            if (rgb) {
                const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b)
                this.hue = hsv.h
                this.saturation = hsv.s
                this.brightness = hsv.v
                this.hexInput = hex
            }
        },

        hexToRgb(hex) {
            // Validate hex format
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
            if (!hexRegex.test(hex)) {
                console.error('Invalid hex color format')
                return null
            }

            // Remove # if present
            hex = hex.replace(/^#/, '')

            // Convert 3-digit hex to 6-digits
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
            }

            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)

            return { r, g, b }
        },

        rgbToHsv(r, g, b) {
            r /= 255
            g /= 255
            b /= 255

            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const d = max - min

            let h
            if (d === 0) h = 0
            else if (max === r) h = ((g - b) / d) % 6
            else if (max === g) h = (b - r) / d + 2
            else h = (r - g) / d + 4

            h = Math.round(h * 60)
            if (h < 0) h += 360

            const s = max === 0 ? 0 : d / max
            const v = max

            return { h, s, v }
        },

        hsvToRgb(h, s, v) {
            const c = v * s
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
            const m = v - c

            let r, g, b
            if (h >= 0 && h < 60) {
                [r, g, b] = [c, x, 0]
            } else if (h >= 60 && h < 120) {
                [r, g, b] = [x, c, 0]
            } else if (h >= 120 && h < 180) {
                [r, g, b] = [0, c, x]
            } else if (h >= 180 && h < 240) {
                [r, g, b] = [0, x, c]
            } else if (h >= 240 && h < 300) {
                [r, g, b] = [x, 0, c]
            } else {
                [r, g, b] = [c, 0, x]
            }

            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255)
            }
        },

        hsvToHex(h, s, v) {
            const rgb = this.hsvToRgb(h, s, v)
            return `#${this.componentToHex(rgb.r)}${this.componentToHex(rgb.g)}${this.componentToHex(rgb.b)}`
        },

        componentToHex(c) {
            const hex = c.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        },

        updateInputMethod() {

            if (this.pickerType === 'circle') {
                // update hue wheel size

                const hueWheel = this.$refs.hueWheel;
                if (!hueWheel) return;

                const size = hueWheel.getBoundingClientRect().width;
                this.colorWheelSize = size;
            }
        },

        setNull() {
            
            this.$emit('update:modelValue', null)
            this.hue = 200
            this.saturation = 1
            this.brightness = 1
            this.hexInput = null
        },
    },
    mounted() {

        // hue wheel resizing

        const hueWheel = this.$refs.hueWheel;
        if (!hueWheel) return;

        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const size = entry.contentRect.width;
                this.colorWheelSize = size;
            }
        });

        this.resizeObserver.observe(hueWheel);
    },

    beforeUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    },
}
</script>

<style scoped>
.colorPicker {

    padding: 0.5rem;
    border: 2px solid #282a30;
    border-radius: 0.25rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    background: #1e1f24;
    font-family: inherit;
    color: #fff;

    overflow: hidden;
    resize: both;

    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* #region TOP BAR */

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pickerTypeSelect {
    height: 2rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #383a42;
    border-radius: 0.25rem;
    background: #25262b;
    color: #fff;
    cursor: pointer;
}

.preview {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid #383a42;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.4);
}

/* #endregion TOP BAR */

/* #region WHEEL */

.circlePicker {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.hueWheel {
    position: relative;
    width: clamp(6rem, 100%, 20rem);
    aspect-ratio: 1/1;
    border-radius: 50%;

    background: 
        conic-gradient(
            hsl(0,   var(--saturation, 100%), var(--brightness, 50%)),
            hsl(60,  var(--saturation, 100%), var(--brightness, 50%)),
            hsl(120, var(--saturation, 100%), var(--brightness, 50%)),
            hsl(180, var(--saturation, 100%), var(--brightness, 50%)),
            hsl(240, var(--saturation, 100%), var(--brightness, 50%)),
            hsl(300, var(--saturation, 100%), var(--brightness, 50%)),
            hsl(360, var(--saturation, 100%), var(--brightness, 50%))
            );
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.25);
    cursor: crosshair;

    display: flex;
    justify-content: center;
    align-items: center;
}

.hueCursor {
    position: absolute;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    outline: 0.375rem solid #1e1f24;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    pointer-events: none;
}

.hueWheel .huePreview {
    position: absolute;
    width: calc(100% - 4rem);
    height: calc(100% - 4rem);
    border-radius: 50%;
    background-color: transparent;

    border: 0.5rem solid #1e1f24;
}

.sliders {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.sliderContainer {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.sliderContainer label {
    font-size: 0.75rem;
    color: #ccc;
    user-select: none;
}

/* #endregion WHEEL */

/* #region SQUARE */

.squarePicker {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.colorSquare {
    position: relative;

    width: clamp(6rem, 100%, 20rem);
    aspect-ratio: 1/1;
    border-radius: 0.5rem;

    background-image: linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, transparent);
    cursor: crosshair;
}

.squareCursor {
    position: absolute;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid white;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    pointer-events: none;
}

/* #endregion SQUARE */

/* #region HEX */

.hexPicker {
    display: flex;
    justify-content: center;
    padding: 10px 0;
}

.hexInputContainer {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hexInputContainer input {
    padding: 6px 8px;
    border: 1px solid #383a42;
    border-radius: 4px;
    background: #25262b;
    color: #fff;
}

/* #endregion HEX */

/* #region INPUTS */

input[type="range"] {
    width: 100%;
    height: 6px;
    appearance: none;
    background: #383a42;
    border-radius: 0.125rem;
    outline: none;
    cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    background: var(--color, #ffffff);
    border-radius: 50%;
    outline: 0.25rem solid #1e1f24;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input[type="range"].gradientBackground {
    background: linear-gradient(to right, var(--from), var(--to)) !important;
}

.hueSlider {
    background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) !important;
}

/* #endregion INPUTS */
</style>