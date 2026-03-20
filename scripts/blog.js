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

makePostForm.addEventListener('submit', (event) => {
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
    blog.prepend(newPost);
    makePostForm.reset();
});


