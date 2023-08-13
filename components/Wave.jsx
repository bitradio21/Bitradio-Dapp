import React, { useContext, useEffect } from 'react'

export default function Wave() {
  useEffect(() => {
    const generateBars = () => {
      const barsContainer = document.querySelector('#bars')

      for (let i = 0; i < 90; i++) {
        const left = i * 2 + 1
        const anim = Math.floor(Math.random() * 75 + 400)
        const height = Math.floor(Math.random() * 25 + 3)

        barsContainer.innerHTML += `<div class="bar" style="left:${left}px;animation-duration:${anim}ms;height:${height}px"></div>`
      }
    }

    generateBars()
  }, [])

  return <div id='bars'></div>
}
