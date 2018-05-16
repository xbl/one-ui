import styles from './cities.styl';
import template from './cities.pug';

// extends some different native constructor
class Cities extends HTMLElement {
  constructor() {
    super();
  }

  // 监听属性列表
  static get observedAttributes() {
    return ['cities'];
  }

  connectedCallback() {
    this.className = styles['cities']
    this.render()
    this.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        const checkedRadio = this.querySelector('input[name="city"]:checked');
        if (checkedRadio) {
          const currentCityCode = checkedRadio.value;
          this.dispatchEvent(new CustomEvent('submit', {
            detail: currentCityCode
          }));
        }
      }
    }, false)
  }

  render() {
    this.innerHTML = template({
      styles,
      cities: this.cities
    });
  }

  // 属性变化的回调
  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case 'cities':
        this.cities = this.groupCitiesByFirstLetter(newValue);
        this.render()
      break;
      default:
        console.log(name + ':' + newValue);
    }
  }

  groupCitiesByFirstLetter(citiesStr) {
    const cities = JSON.parse(citiesStr);
    return cities.sort((a, b) => {
      if (a.firstLetter < b.firstLetter) {
        return -1;
      } else if (a.firstLetter === b.firstLetter) {
        return 0;
      }
      return 1;
    });

    // let groupArr = [], currentLetter = '';
    // cities.forEach((city, i) => {
    //   if (currentLetter === city.firstLetter) {

    //   }
    //   groupArr.push({})
    // });
  }
}

// define it specifying what's extending
customElements.define('cities-dialog', Cities);

