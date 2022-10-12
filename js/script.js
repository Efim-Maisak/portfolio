'use strict';

document.addEventListener( 'DOMContentLoaded', function () {

    // Кастомный селект

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

    CustomSelect.template = params => {
      const name = params['name'];
      const options = params['options'];
      const targetValue = params['targetValue'];
      const items = [];
      let selectedIndex = -1;
      let selectedValue = '';
      let selectedContent = 'Выберите из списка';
      options.forEach((option, index) => {
        let selectedClass = '';
        if (option[0] === targetValue) {
          selectedClass = ' select__option_selected';
          selectedIndex = index;
          selectedValue = option[0];
          selectedContent = option[1];
        }
        items.push(`<li class="select__option${selectedClass}" data-select="option" data-value="${option[0]}" data-index="${index}">${option[1]}</li>`);
      });
      return `<button type="button" class="select__toggle" name="${name}" value="${selectedValue}" data-select="toggle" data-index="${selectedIndex}">${selectedContent}</button>
      <div class="select__dropdown">
        <ul class="select__options">${items.join('')}</ul>
      </div>`;
    };

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.select')) {
        document.querySelectorAll(CustomSelect.SELECTOR_ACTIVE).forEach(select => {
          select.classList.remove(CustomSelect.CLASS_NAME_ACTIVE);
        });
      }
    });

    const select1 = new CustomSelect('#select-1');


    // Навигация по меню

    const menuLinks = document.querySelectorAll('.menu__link');
    const contentPanelChild = document.querySelectorAll('[data-menu]');

    function pickMenuLink() {

        menuLinks.forEach((item, index) => {
            item.addEventListener('click', event => {
                if(event.target == item) {
                    addClassHide();
                    contentPanelChild[index].classList.add('show');
                    contentPanelChild[index].classList.remove('hide');
                    if(event.target.getAttribute('data-link') == 'projects') {
                      getProjects();
                      select1.selectedIndex = 0; // сброс селекта (исходное положение -1)
                    }
                }
            });
        });
    }

    pickMenuLink();

    function addClassHide() {
        contentPanelChild.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show');
        });
    }


    // Валидация формы

    function preValidation() {
        const inputs = document.querySelectorAll('.form__input');

        inputs.forEach( input => input.addEventListener('input', () => {
            if (!input.value) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
                if (inputs[0].value == "" || inputs[1].value == "" || inputs[2].value == "" || inputs[3].value == "") {
                    submitButton.classList.add('inactive');
                } else {
                    submitButton.classList.remove('inactive');
                }
            }
        }));
    }

    preValidation();


    function formValidation() {

        const inputs = document.querySelectorAll('.form__input');
        const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        let error = 0;

        inputs.forEach( input => {
            if (!input.value) {
                input.classList.add('error');
                error++;
            } else if (input.hasAttribute('data-mail') && !input.value.match(reg)) {
                input.classList.add('error');
                error++;
            } else {
                input.classList.remove('error');
                submitButton.classList.remove('inactive');
            }
        });

        return error;
    }

  // Отправка формы

  const form = document.querySelector('.form-body');
  const submitButton = document.querySelector('.form__button');
  const spinnerElement = document.createElement('img');
  const alertElement = document.querySelector('.alert');

  const message = {
      loading: '/img/spinner/rolling-blue-32.svg',
      sucsess: 'Спасибо, ваше сообщение успешно отправлено',
      failure: 'Упс! Что-то пошло не так...',
      error: 'Перепроверьте поля формы'
  };

  submitButton.classList.add('inactive');

    function sendForm() {

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let formError = formValidation();

            if(formError == 0) {

                spinnerElement.src = message.loading;

                spinnerElement.style.cssText = `
                    display: block;
                    margin: 0 auto;
                `;

                form.insertAdjacentElement("beforeend", spinnerElement);

                const formData = new FormData(form);

                const formDataObj = {};

                formData.forEach((value, key) => {
                    formDataObj[key] = value;
                });

                const requestBody = {
                    field_492636: formDataObj.subject,
                    field_492637: formDataObj.message,
                    field_492638: formDataObj.name,
                    field_492640: formDataObj.email
                };

                fetch('https://coldnaked.herokuapp.com/webhook/postForm', {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(requestBody)
                }).then( response => {
                    //console.log(response);
                    alertElement.classList.add('show');
                    alertElement.classList.remove('hide');
                    alertElement.querySelector('.alert__message').textContent = message.sucsess;
                    alertElement.style.backgroundColor = '#088A68';
                }).catch(() => {
                    alertElement.classList.add('show');
                    alertElement.classList.remove('hide');
                    alertElement.querySelector('.alert__message').textContent = message.failure;
                    alertElement.style.backgroundColor = '#ED2E38';
                }).finally(() => {
                    form.reset();
                    spinnerElement.remove();
                    setTimeout(() => {
                        alertElement.classList.add('hide');
                        alertElement.classList.remove('show');
                    }, 3000);
                });
                } else {
                    submitButton.classList.add('inactive');
                    alertElement.classList.add('show');
                    alertElement.classList.remove('hide');
                    alertElement.querySelector('.alert__message').textContent = message.error;
                    alertElement.style.backgroundColor = '#ED2E38';
                setTimeout(() => {
                    alertElement.classList.add('hide');
                    alertElement.classList.remove('show');
                }, 3000);
            }
        });

    }

    sendForm();


  // Отображение карточек проектов

  const parentCardElement = document.querySelector('.projects-window');
  const spinnerCardElement = document.querySelector('.projects-window__spinner');

  let projectsData = {};

  async function getProjects() {

    class ProjectCard {
      constructor(pictureThumbnail, alt, picture, title, category, about, url) {
        this.pictureThumbnail = pictureThumbnail;
        this.alt = alt;
        this.picture = picture;
        this.title = title;
        this.category = category;
        this.about = about;
        this.url = url;
      }

      renderCard() {
        const projectsElement = document.createElement('div');
        projectsElement.innerHTML = `
          <div class="projects-card">
            <div class="projects-card__image"><img src="${this.pictureThumbnail}" alt="${this.alt}"></div>
            <div class="projects-card__title">${this.title}</div>
            <div class="projects-card__category"><span>${this.category}</span></div>
          </div>
        `;
        parentCardElement.append(projectsElement);

      }

    }

    spinnerCardElement.classList.add('show');

    try {
      await fetch('https://api.baserow.io/api/database/rows/table/76335/?filter__field_569928__boolean=true', {
        method: 'GET',
        headers: {
          'Authorization': 'Token xnhNvrP8Rpqa5Vr8bEIbIsPCCBC65vpE'
        }
      }).then( response => {
        return response.json();
      }).then( data => {
          spinnerCardElement.classList.remove('show');
          parentCardElement.innerHTML = "";
          projectsData =JSON.parse(JSON.stringify(data));
          projectsData.results.forEach(item => {

            if(Array.isArray(item.field_569927) && item.field_569927.length == 0) {
              item.field_569927[0] = {url: ''};
            }

            if(Array.isArray(item.field_463831) && item.field_463831.length == 0) {
              item.field_463831[0] = {url: ''};
            }

            new ProjectCard(item.field_569927[0].url, 'project-picture', item.field_463831[0].url, item.field_463826, item.field_463830.value, item.field_463827, item.field_463829).renderCard();

          });
        });
    } catch(e) {
      new Error('POST request is failed');
    }



  }

  // Фильтр карточек с проектами

  const selectOptions = document.querySelectorAll('#select-1 li');
  let filteredDataCopy = [];

  function filterProject(selectedOption) {

    let filteredData = [];

    projectsData.results.forEach(item => {
      if(item.field_463830.value == selectedOption) {
        filteredData.push(item);
      }
    });

    filteredDataCopy = filteredData;

    if(selectedOption == 'Все') {

      parentCardElement.innerHTML = "";

      projectsData.results.forEach(item => {
        const projectsElem = document.createElement('div');
        projectsElem.innerHTML = `
          <div class="projects-card">
            <div class="projects-card__image"><img src="${item.field_569927[0].url}" alt="project-picture"></div>
            <div class="projects-card__title">${item.field_463826}</div>
            <div class="projects-card__category"><span>${item.field_463830.value}</span></div>
          </div>
        `;
        parentCardElement.append(projectsElem);
      });
    } else {

      parentCardElement.innerHTML = "";

      filteredData.forEach(item => {
        const projectsElem = document.createElement('div');
        projectsElem.innerHTML = `
          <div class="projects-card">
            <div class="projects-card__image"><img src="${item.field_569927[0].url}" alt="project-picture"></div>
            <div class="projects-card__title">${item.field_463826}</div>
            <div class="projects-card__category"><span>${item.field_463830.value}</span></div>
          </div>
        `;
        parentCardElement.append(projectsElem);
      });
    }
  }

  selectOptions.forEach(item => {
    item.addEventListener('click', event => {
        if(event.target == item && event.target.getAttribute('data-value') == 'landing') {
          filterProject('Лендинг');
        } else if(event.target == item && event.target.getAttribute('data-value') == 'site') {
          filterProject('Сайт');
        } else if(event.target == item && event.target.getAttribute('data-value') == 'web-application') {
          filterProject('Веб приложение');
        } else if(event.target == item && event.target.getAttribute('data-value') == 'telegtam-bot') {
          filterProject('Телеграм бот');
        } else if(event.target == item && event.target.getAttribute('data-value') == 'other') {
          filterProject('Другое');
        } else {
          filterProject('Все');
        }
    });
  });

  // Отображение модального окна проекта

  const projectModal = document.querySelector('.modal');

  parentCardElement.addEventListener('DOMSubtreeModified', () => {
    const projectsCards = document.querySelectorAll('.projects-card');
    openProjectModal(projectsCards, projectModal);
    });


  function openProjectModal(cardsElem , modalElem) {

    cardsElem.forEach( (elem, index) => {
      elem.addEventListener('click', event => {
        if(event.currentTarget == elem) {
          modalElem.classList.add('show');
          modalElem.classList.remove('hide');
          showModalContent(index, projectsData, filteredDataCopy);
        }
      });
    });

  }


  function showModalContent(index, data, dataFiltered) {

    const modalContentElement = document.querySelector('.modal__content');

    if(document.querySelector('.select__toggle').getAttribute('data-index') > 0) {
      modalContentElement.innerHTML = `
      <button data-close class="modal__close-button"><img src="./img/modal/close.svg" width="18" alt="close"></button>
      <div class="modal__image"><img src="${dataFiltered[index].field_463831[0].url}"></div>
      <div class="modal__title">${dataFiltered[index].field_463826}</div>
      <div class="modal__info">${dataFiltered[index].field_463827.replace(/\n\r?/g, '<br/>')}</div>
      <div class="modal__link"><a target="_blank" style="color: #000" href="${dataFiltered[index].field_463829}">${dataFiltered[index].field_463829}</a></div>
      `;
    } else {
      modalContentElement.innerHTML = `
      <button data-close class="modal__close-button"><img src="./img/modal/close.svg" width="18" alt="close"></button>
      <div class="modal__image"><img src="${data.results[index].field_463831[0].url}"></div>
      <div class="modal__title">${data.results[index].field_463826}</div>
      <div class="modal__info">${data.results[index].field_463827.replace(/\n\r?/g, '<br/>')}</div>
      <div class="modal__link"><a target="_blank" style="color: #000" href="${data.results[index].field_463829}">${data.results[index].field_463829}</a></div>
      `;
    }
    closeProjectModal(projectModal);
  }


  function closeProjectModal(modalElem) {

    const modalClose = document.querySelector('.modal__close-button img');

    modalElem.addEventListener('click', event => {
      if(event.target === modalElem || event.target == modalClose) {
        modalElem.classList.add('hide');
        modalElem.classList.remove('show');
      }
    });

    document.addEventListener("keydown", event => {
      if (event.code === "Escape" && modalElem.classList.contains("show")) {
        modalElem.classList.add('hide');
        modalElem.classList.remove('show');
      }
    });
  }

  // Анимация прогресс бара

  const listElement = document.querySelectorAll('.about-me__list-item'),
        progressBarElements = document.querySelectorAll('.progress-bar span');

  listElement.forEach( item => {
    item.addEventListener('mouseover', (event) => {
      if(event.target == item) {
          if(event.target.getAttribute('data-list-name') == "html") {
            progressBarElements[0].style.width = '80%';
          } else if(event.target.getAttribute('data-list-name') == "css") {
            progressBarElements[1].style.width = '80%';
          }else if(event.target.getAttribute('data-list-name') == "sass") {
            progressBarElements[2].style.width = '60%';
          }else if(event.target.getAttribute('data-list-name') == "js") {
            progressBarElements[3].style.width = '70%';
          }else if(event.target.getAttribute('data-list-name') == "json") {
            progressBarElements[4].style.width = '90%';
          }else if(event.target.getAttribute('data-list-name') == "git") {
            progressBarElements[5].style.width = '60%';
          }else if(event.target.getAttribute('data-list-name') == "react") {
            progressBarElements[6].style.width = '10%';
          }
      }
    });
  });




});