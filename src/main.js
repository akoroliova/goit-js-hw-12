import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const apiKey = '42062449-cea48752956c1d9094f31db98';
const searchForm = document.querySelector('form.search-form');
const loaderElement = document.querySelector('.loader');
const imagesList = document.querySelector('.gallery');
const loadMoreButtonBlock = document.querySelector('.load-more-div');
const loadMoreButton = document.querySelector('.load-more-div button');
const lightboxInstance = new SimpleLightbox('.gallery .gallery-link', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
});
const perPage = 15;
let userQuery;
let page = 1;

async function handleSubmit(event) {
  event.preventDefault();

  const inputValue = event.target.elements['search-field'].value;
  if (inputValue.trim().length === 0) {
    return;
  }

  imagesList.innerHTML = '';

  page = 1;
  hideButton();
  showLoader();

  userQuery = encodeURIComponent(inputValue);

  try {
    const firstPageResponse = await fetchImages(userQuery);
    const totalImagesCount = firstPageResponse.data.totalHits;

    if (totalImagesCount === 0) {
      hideLoader();
      iziToast.error({
        position: 'topRight',
        title: '',
        message:
          'Sorry, there are no images matching your search query. Please, try again!',
      });
    } else {
      hideLoader();
      const imagesInitialArray = firstPageResponse.data.hits;
      const imagesResultingArray = mapResponseData(imagesInitialArray);
      renderImages(imagesResultingArray);
      searchForm.reset();
      if (totalImagesCount > perPage) {
        showButton();
      }
    }
  } catch (error) {
    console.log(error);
    hideLoader();
  }
}
searchForm.addEventListener('submit', handleSubmit);

async function handleClick(event) {
  event.preventDefault();
  hideButton();
  showLoader();

  try {
    page += 1;

    const subsequentPageResponse = await fetchImages(userQuery);
    const totalImagesCount = subsequentPageResponse.data.totalHits;
    const totalPagesCount = Math.ceil(totalImagesCount / perPage);

    if (page >= totalPagesCount) {
      hideLoader();
      return iziToast.error({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else if (page === totalPagesCount) {
      hideLoader();
      const imagesInitialArray = subsequentPageResponse.data.hits;
      const imagesResultingArray = mapResponseData(imagesInitialArray);
      renderImages(imagesResultingArray);
      return iziToast.error({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      hideLoader();
      showButton();
      const imagesInitialArray = subsequentPageResponse.data.hits;
      const imagesResultingArray = mapResponseData(imagesInitialArray);

      renderImages(imagesResultingArray);

      const card = document.querySelector('.gallery-card');
      const cardDOMRect = card.getBoundingClientRect();
      const options = {
        top: cardDOMRect.height * 2,
        behavior: 'smooth',
      };
      window.scrollBy(options);
    }
  } catch (error) {
    console.log(error);
  }
}
loadMoreButton.addEventListener('click', handleClick);

async function fetchImages(userQuery) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${userQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
}

function renderImages(imagesResultingArray) {
  const liElements = imagesResultingArray
    .map(image => {
      return `<li class="gallery-card"><a class="gallery-link" href="${image.href}"><img class="gallery-image" src="${image.src}" alt="${image.alt}" /><div class="image-stats-card"><div class="image-stats-block"><p>Likes</p>${image.likes}</div><div class="image-stats-block"><p>Views</p>${image.views}</div><div class="image-stats-block"><p>Comments</p>${image.comments}</div><div class="image-stats-block"><p>Downloads</p>${image.downloads}</div></div></a></li>`;
    })
    .join('');
  imagesList.insertAdjacentHTML('beforeend', liElements);

  lightboxInstance.refresh();
}

function mapResponseData(hits) {
  return hits.map(eachObject => {
    return {
      href: eachObject.largeImageURL,
      src: eachObject.webformatURL,
      alt: eachObject.tags,
      likes: eachObject.likes,
      views: eachObject.views,
      comments: eachObject.comments,
      downloads: eachObject.downloads,
    };
  });
}

function showLoader() {
  loaderElement.style.display = 'block';
}
function hideLoader() {
  loaderElement.style.display = 'none';
}
function showButton() {
  loadMoreButtonBlock.style.display = 'flex';
}
function hideButton() {
  loadMoreButtonBlock.style.display = 'none';
}
