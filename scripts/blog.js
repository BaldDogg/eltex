// сайд-бар константы
const statsButton = document.querySelector(".statistics-aside");
const dialog = document.querySelector(".stats-dialog");
const closeDialog = document.querySelector(".close-stats-button");
const mobileMenu = document.querySelector(".mobile-menu-toggle");
const menuBar = document.querySelector(".blog-aside-bar");
const makePostAside = document.querySelector(".make-post-aside");

// добавить статью константы
const undoPostButton = document.querySelector(".undo-post-button");
const makePost = document.querySelector(".make-post-section");
const blog = document.querySelector(".blog");
const postTemplate = document.querySelector(".post-template");
const makePostForm = document.querySelector(".make-post");
const imageInput = document.querySelector(".make-post-image");
const imageInputLabel = document.querySelector(".make-post-image-label");
const themeSelect = document.querySelector(".make-post-theme");
const themeSelectCustom = document.querySelector(".make-post-theme-custom");

// удалить пост константы
const noPostsMessage = document.querySelector(".no-posts");

// класс для постов в блоге
class Post {
    // данные для новой статьи
    constructor(image, title, theme, text, date = null, id = null) {
        this.title = title;
        this.theme = theme;
        this.text = text;
        this.image = image;
        this.date = date || new Date().toLocaleDateString('ru-RU');
        this.id = id || crypto.randomUUID();
    }

    // заполнение шаблона из blog.html
    render() {
        const newPost = postTemplate.content.cloneNode(true);
        const newArticle = newPost.querySelector("article");

        const templatePostTitle = newArticle.querySelector(".post-title");
        const templatePostText = newArticle.querySelector(".post-text");
        const templatePostTheme = newArticle.querySelector(".post-theme");
        const templatePostTime = newArticle.querySelector(".post-time");
        const templatePostImage = newArticle.querySelector(".blog-image");

        templatePostTitle.textContent = this.title;
        templatePostTitle.setAttribute("title", this.title);
        templatePostText.textContent = this.text;

        if (templatePostTheme) templatePostTheme.textContent = this.theme;
        if (templatePostTime) templatePostTime.textContent = this.date;

        if (templatePostImage && this.image) {
            templatePostImage.src = this.image;
        }

        // создаем id, чтобы потом удалять по нему посты
        newArticle.dataset.id = this.id;

        return newArticle;
    }
}

// сайд-бар ивенты
// сайд-бар в мобильной версии со стрелкой
mobileMenu.addEventListener('click', () => {
    menuBar.classList.toggle("is-open");
});

// статистика
statsButton.addEventListener('click', () => {
    // считаем посты, будущие комментарии
    const postCount = document.querySelectorAll(".blog-post").length;
    const commentsCount = document.querySelectorAll(".comment").length;
    const commentsCountDisplay = document.querySelector(".comments-count");
    const postsCountDisplay = document.querySelector(".posts-count");

    postsCountDisplay.textContent = postCount;
    if (commentsCountDisplay) commentsCountDisplay.textContent = commentsCount;

    dialog.showModal();
});

// закрытие сайд-бара
document.addEventListener('click', (event) => {
    const isClickInsideBar = event.target.closest('.blog-aside-bar');
    if (!isClickInsideBar) {
        menuBar.classList.remove("is-open");
    }
});

// закрытие диалогового окна статистики
closeDialog.addEventListener('click', () => {
    dialog.close();
});

// проверка кликов вне окна, если находит - закрытие окна
dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickIsOutside = (
        event.clientY < rect.top ||
        event.clientY > rect.bottom ||
        event.clientX < rect.left ||
        event.clientX > rect.right
    );
    if (clickIsOutside) {
        dialog.close();
    }
});

// добавить статью ивенты
// прокрутка до формы создания поста
makePostAside.addEventListener('click', () => {
    makePost.classList.add("is-open");
    makePost.scrollIntoView({ behavior: "smooth" });
});

// отмена
undoPostButton.addEventListener('click', () => {
    makePost.classList.remove("is-open");
});

// отображение имени загруженного изображения
imageInput.addEventListener('change', (event) => {
    if (imageInput.files && imageInput.files.length > 0) {
        const fileName = imageInput.files[0].name;
        imageInputLabel.textContent = `Выбран файл: ${fileName}`;
    } else {
        imageInputLabel.textContent = 'Загрузить картинку';
    }
});

// выбор "другое" в темах (открывается окошко для самостоятельного создания темы)
themeSelect.addEventListener('change', (event) => {
    if (event.target.value === 'other') {
        themeSelectCustom.style.display = 'block';
        themeSelectCustom.required = true;
    } else {
        themeSelectCustom.style.display = 'none';
        themeSelectCustom.required = false;
        themeSelectCustom.value = '';
    }
});

// локальное хранилище
// массив, где будут лежать данные всех постов (создаем пустой, если нет в памяти)
let postsDataArray = JSON.parse(localStorage.getItem('blogPosts')) || [];

// функция для записи массива
function savePostsToStorage() {
    localStorage.setItem('blogPosts', JSON.stringify(postsDataArray));
}

// функция для загрузки постов из памяти
function renderSavedPosts() {
    // цикл перебирает массив с конца в начало, чтобы новые посты были сверху
    for (let i = postsDataArray.length - 1; i >= 0; i--) {
        const data = postsDataArray[i];
        const savedPost = new Post(data.image, data.title, data.theme, data.text, data.date, data.id);
        blog.append(savedPost.render());
    }
}

// вызов функции загрузки постов
renderSavedPosts();

// отправка формы (создание поста)
makePostForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newPostTitle = makePostForm.querySelector(".make-post-title").value;
    const newPostText = makePostForm.querySelector(".make-post-text").value;

    let newPostTheme = themeSelect.value;
    if (newPostTheme === 'other') {
        newPostTheme = themeSelectCustom.value;
    }

    // функция для сохранения поста
    const createAndSavePost = (imageSrc) => {
        const myNewPost = new Post(imageSrc, newPostTitle, newPostTheme, newPostText);

        blog.prepend(myNewPost.render());

        // сохраняем данные в массив 
        postsDataArray.push({
            id: myNewPost.id,
            title: myNewPost.title,
            theme: myNewPost.theme,
            text: myNewPost.text,
            date: myNewPost.date,
            image: myNewPost.image
        });

        // записываем массив в localstorage
        savePostsToStorage();

        // очищаем форму, потом убираем
        makePostForm.reset();
        imageInputLabel.textContent = 'Загрузить картинку';
        themeSelectCustom.style.display = 'none';
        makePost.classList.remove("is-open");
        noPostsMessage.classList.remove("is-visible");
    };

    // проверка изображения
    if (imageInput.files && imageInput.files.length > 0) {
        // читаем картинку как текст
        const reader = new FileReader();
        reader.onload = function (e) {
            createAndSavePost(e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // если картинки нет, используем заглушку
        const defaultImage = 'assets/kotik-template.jpg';
        createAndSavePost(defaultImage);
    }
});

// удалить статью ивенты
blog.addEventListener('click', (event) => {
    const isDeleteButton = event.target.closest(".delete-post-button");
    if (!isDeleteButton) return;

    // поиск по классу
    const postToDelete = event.target.closest(".blog-post");
    if (!postToDelete) return;

    const postId = postToDelete.dataset.id;

    // удаляем из массива
    postsDataArray = postsDataArray.filter(post => post.id !== postId);
    savePostsToStorage();

    // удаляем из dom
    postToDelete.remove();

    // показываем заглушку, если больше нет постов
    if (postsDataArray.length === 0) {
        noPostsMessage.classList.add("is-visible");
    }
});

// проверка, есть ли посты при загрузке страницы (если нет, то появляется заглушка)
if (postsDataArray.length === 0) {
    noPostsMessage.classList.add("is-visible");
}