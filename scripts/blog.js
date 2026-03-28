// сайд-бар константы
const statsButton = document.querySelector(".statistics-aside");
const dialog = document.querySelector(".stats-dialog");
const closeDialog = document.querySelector(".close-stats-button");
const mobileMenu = document.querySelector(".mobile-menu-toggle");
const menuBar = document.querySelector(".blog-aside-bar");
const makePostAside = document.querySelector(".make-post-aside");

// добавить статью костанты
const undoPostButton = document.querySelector(".undo-post-button");
const makePost = document.querySelector(".make-post-section");
const blog = document.querySelector(".blog")
const postTemplate = document.querySelector(".post-template");
const makePostForm = document.querySelector(".make-post");
const imageInput = document.querySelector(".make-post-image");
const imageInputLabel = document.querySelector(".make-post-image-label");
const themeSelect = document.querySelector(".make-post-theme")
const themeSelectCustom = document.querySelector(".make-post-theme-custom")

// удалить пост константы
const noPostsMessage = document.querySelector(".no-posts");

class Post {
    constructor(image, title, theme, text, date = null, id = null) {
        this.title = title;
        this.theme = theme;
        this.text = text;
        this.image = image;
        this.date = date || new Date().toLocaleDateString('ru-RU');
        this.id = id || crypto.randomUUID();
    }

    render() {

    }
}

// сайд-бар ивенты
mobileMenu.addEventListener('click', () => {
    menuBar.classList.toggle("is-open");
});

statsButton.addEventListener('click', () => {
    const postCount = document.querySelectorAll(".post").length;
    const commentsCount = document.querySelectorAll(".comment").length;
    const commentsCountDisplay = document.querySelector(".comments-count");
    const postsCountDisplay = document.querySelector(".posts-count");
    postsCountDisplay.textContent = postCount;
    commentsCountDisplay.textContent = commentsCount;
    dialog.showModal();
});

document.addEventListener('click', (event) => {
    const isClickInsideBar = event.target.closest('.blog-aside-bar');
    if (!isClickInsideBar) {
        menuBar.classList.remove("is-open");
    }
});

closeDialog.addEventListener('click', () => {
    dialog.close();
});

dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickIsOtside = (
        event.clientY < rect.top ||
        event.clientY > rect.bottom ||
        event.clientX < rect.left ||
        event.clientX > rect.right
    )
    if (clickIsOtside) {
        dialog.close();
    }
});

// добавить статью ивенты
makePostAside.addEventListener('click', () => {
    makePost.classList.add("is-open");
    makePost.scrollIntoView({ behavior: "smooth" })
});

undoPostButton.addEventListener('click', () => {
    makePost.classList.remove("is-open");
});

imageInput.addEventListener('change', (event) => {
    if (imageInput.files && imageInput.files.length > 0) {
        const fileName = imageInput.files[0].name;
        imageInputLabel.textContent = `Выбран файл: ${fileName}`;
    } else {
        imageInputLabel.textContent = 'Загрузить картинку';
    }
});

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

makePostForm.addEventListener('submit', (event) => {
    noPostsMessage.classList.remove("is-visible");
    const currentLastPost = document.querySelector(".last-blog-post");
    event.preventDefault();
    if (currentLastPost) {
        currentLastPost.classList.remove("last-blog-post");
        currentLastPost.classList.add("blog-post");
        const oldImageWrapper = currentLastPost.querySelector(".last-blog-image");
        if (oldImageWrapper) {
            oldImageWrapper.classList.remove("last-blog-image");
            const imgInside = oldImageWrapper.querySelector("img");
            if (imgInside) {
                imgInside.classList.add("blog-image");
                oldImageWrapper.parentNode.insertBefore(imgInside, oldImageWrapper);
                oldImageWrapper.remove();
            }
        }
    }
    const newPost = postTemplate.content.cloneNode(true);
    const newArticle = newPost.querySelector("article");

    newArticle.classList.remove("blog-post");
    newArticle.classList.add("last-blog-post");
    const newImg = newArticle.querySelector(".blog-image");
    if (newImg) {
        newImg.classList.remove("blog-image");
        const newWrapper = document.createElement("div");
        newWrapper.classList.add("last-blog-image");
        newImg.parentNode.insertBefore(newWrapper, newImg);
        newWrapper.appendChild(newImg);
    }
    const templatePostTitle = newArticle.querySelector(".post-title");
    const templatePostText = newArticle.querySelector(".post-text");
    const newPostTitle = makePostForm.querySelector(".make-post-title").value;
    const newPostText = makePostForm.querySelector(".make-post-text").value;

    templatePostTitle.setAttribute("title", newPostTitle);
    templatePostTitle.textContent = newPostTitle;
    templatePostText.textContent = newPostText;
    blog.prepend(newPost);
    makePostForm.reset();
});

// удалить статью ивенты
blog.addEventListener('click', (event) => {
    const isDeleteButton = event.target.closest(".delete-post-button");
    if (!isDeleteButton) {
        return;
    }
    const postToDelete = event.target.closest("article");
    if (postToDelete) {
        const isLastPost = postToDelete.classList.contains("last-blog-post");
        postToDelete.remove();
        if (isLastPost) {
            const nextPost = document.querySelector("article");
            if (nextPost) {
                nextPost.classList.remove("blog-post");
                nextPost.classList.add("last-blog-post");
                const newImg = nextPost.querySelector(".blog-image");
                if (newImg) {
                    newImg.classList.remove("blog-image");
                    const newWrapper = document.createElement("div");
                    newWrapper.classList.add("last-blog-image");
                    newImg.parentNode.insertBefore(newWrapper, newImg);
                    newWrapper.appendChild(newImg);
                }
            }
        }
        if (blog.querySelectorAll("article").length === 0) {
            noPostsMessage.classList.add("is-visible");
        }
    }

});

if (blog.querySelectorAll("article").length === 0) {
    noPostsMessage.classList.add("is-visible");
}