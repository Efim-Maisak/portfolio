class CustomSelect {
    static CLASS_NAME_SELECT = 'select';
    static CLASS_NAME_ACTIVE = 'select_show';
    static CLASS_NAME_SELECTED = 'select__option_selected';
    static SELECTOR_ACTIVE = '.select_show';
    static SELECTOR_DATA = '[data-select]';
    static SELECTOR_DATA_TOGGLE = '[data-select="toggle"]';
    static SELECTOR_OPTION_SELECTED = '.select__option_selected';

    constructor(target, params) {
      this._elRoot = typeof target === 'string' ? document.querySelector(target) : target;
      this._params = params || {};
      this._onClickFn = this._onClick.bind(this);
      if (this._params.options) {
        this._elRoot.classList.add(CustomSelect.CLASS_NAME_SELECT);
        this._elRoot.innerHTML = CustomSelect.template(this._params);
      }
      this._elToggle = this._elRoot.querySelector(CustomSelect.SELECTOR_DATA_TOGGLE);
      this._elRoot.addEventListener('click', this._onClickFn);
    }
    _onClick(e) {
      const target = e.target;
      const type = target.closest(CustomSelect.SELECTOR_DATA).dataset.select;
      if (type === 'toggle') {
        this.toggle();
      } else if (type === 'option') {
        this._changeValue(target);
      }
    }
    _update(option) {
      option = option.closest('.select__option');
      const selected = this._elRoot.querySelector(CustomSelect.SELECTOR_OPTION_SELECTED);
      if (selected) {
        selected.classList.remove(CustomSelect.CLASS_NAME_SELECTED);
      }
      option.classList.add(CustomSelect.CLASS_NAME_SELECTED);
      this._elToggle.textContent = option.textContent;
      this._elToggle.value = option.dataset['value'];
      this._elToggle.dataset.index = option.dataset['index'];
      this._elRoot.dispatchEvent(new CustomEvent('select.change'));
      this._params.onSelected ? this._params.onSelected(this, option) : null;
      return option.dataset['value'];
    }
    _reset() {
      const selected = this._elRoot.querySelector(CustomSelect.SELECTOR_OPTION_SELECTED);
      if (selected) {
        selected.classList.remove(CustomSelect.CLASS_NAME_SELECTED);
      }
      this._elToggle.textContent = 'Выберите из списка';
      this._elToggle.value = '';
      this._elToggle.dataset.index = -1;
      this._elRoot.dispatchEvent(new CustomEvent('select.change'));
      this._params.onSelected ? this._params.onSelected(this, null) : null;
      return '';
    }
    _changeValue(option) {
      if (option.classList.contains(CustomSelect.CLASS_NAME_SELECTED)) {
        return;
      }
      this._update(option);
      this.hide();
    }
    show() {
      document.querySelectorAll(CustomSelect.SELECTOR_ACTIVE).forEach(select => {
        select.classList.remove(CustomSelect.CLASS_NAME_ACTIVE);
      });
      this._elRoot.classList.add(CustomSelect.CLASS_NAME_ACTIVE);
    }
    hide() {
      this._elRoot.classList.remove(CustomSelect.CLASS_NAME_ACTIVE);
    }
    toggle() {
      if (this._elRoot.classList.contains(CustomSelect.CLASS_NAME_ACTIVE)) {
        this.hide();
      } else {
        this.show();
      }
    }
    dispose() {
      this._elRoot.removeEventListener('click', this._onClickFn);
    }
    get value() {
      return this._elToggle.value;
    }
    set value(value) {
      let isExists = false;
      this._elRoot.querySelectorAll('.select__option').forEach((option) => {
        if (option.dataset['value'] === value) {
          isExists = true;
          return this._update(option);
        }
      });
      if (!isExists) {
        return this._reset();
      }
    }
    get selectedIndex() {
      return this._elToggle.dataset['index'];
    }
    set selectedIndex(index) {
      const option = this._elRoot.querySelector(`.select__option[data-index="${index}"]`);
      if (option) {
        return this._update(option);
      }
      return this._reset();
    }
}

export default CustomSelect;