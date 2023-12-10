class EloSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /* HTML */ `
      <style>
        .container {
          margin: 30px 50px 20px 0;
          position: relative;
          height: 1px;
          width: 150px;
          background-color: #484747;
        }
        .lowest,
        .current,
        .highest {
          position: absolute;
          bottom: -5px;
          height: 10px;
          width: 5px;
          background-color: rgb(186, 186, 186);
        }
        .lowest {
          left: 0;
          transform: translateX(-50%);
        }
        .highest {
          right: 0;
          transform: translateX(50%);
        }
        .lowest_value,
        .current_value,
        .highest_value {
          font-size: 12px;
          position: absolute;
          top: 17px;
          transform: translateX(-50%);
        }
        .current {
          bottom: -10px;
          height: 20px;
          left: 50%;
        }
        .current_value {
          top: -20px;
          left: 50%;
        }
      </style>

      <div class="container">
        <div class="lowest">
          <div id="lowest" class="lowest_value"></div>
        </div>
        <div class="current">
          <div id="current" class="current_value"></div>
        </div>
        <div class="highest">
          <div id="highest" class="highest_value"></div>
        </div>
      </div>
    `;
  }

  setSlider({ lowestRating, lowestRatingDateTime, highestRating, highestRatingDateTime, currentRating }) {
    const shadow = this.shadowRoot;

    const lowest = shadow.getElementById("lowest");
    lowest.innerText = lowestRating;
    lowest.title = new Date(lowestRatingDateTime)?.toLocaleDateString();

    const highest = shadow.getElementById("highest");
    highest.innerText = highestRating;
    highest.title = new Date(highestRatingDateTime)?.toLocaleDateString();

    const current = shadow.getElementById("current");
    current.innerText = Math.floor(currentRating);

    const range = highestRating - lowestRating;
    const diff = currentRating - lowestRating;
    const percentageIncrease = (diff / range) * 100;

    shadow.querySelector(".current").style.left = `${percentageIncrease}%`;
  }
}

customElements.define("elo-slider", EloSlider);
