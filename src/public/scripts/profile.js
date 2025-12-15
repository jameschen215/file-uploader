import { showModal } from './lib/modal-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const uploadAvatarButton = document.querySelector('.upload-avatar-btn');
  const editProfileButton = document.querySelector('.edit-profile-btn');
  const changePswButton = document.querySelector('.change-psw-btn');
  const deleteUserButton = document.querySelector('.delete-user-btn');

  uploadAvatarButton.addEventListener('click', () => {
    console.log('Handle upload avatar');
  });

  editProfileButton.addEventListener('click', handleEditProfile);

  changePswButton.addEventListener('click', () => {
    console.log('Handle change password');
  });

  deleteUserButton.addEventListener('click', () => {
    console.log('Handle delete user');
  });

  // Handlers
  function handleEditProfile() {
    const editProfileModal = document.querySelector('#edit-profile-modal');
    const user = JSON.parse(editProfileButton.dataset.user);

    showModal({ modal: editProfileModal, user });
  }
});
