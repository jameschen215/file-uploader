import { showModal } from './lib/modal-helpers.js';
import { showToast } from './components/toast.js';
import { confirmDeletion } from './components/modals/confirm-modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const profile = document.querySelector('.profile');
  const editProfileButton = document.querySelector('.edit-profile-btn');
  const changePswButton = document.querySelector('.change-psw-btn');
  const deleteUserButton = document.querySelector('.delete-user-btn');

  if (editProfileButton) {
    editProfileButton.addEventListener('click', handleEditProfile);
  }

  if (changePswButton) {
    changePswButton.addEventListener('click', handleUpdatePassword);
  }

  deleteUserButton.addEventListener('click', handleDeleteUser);

  // Handlers
  function handleEditProfile() {
    const editProfileModal = document.querySelector('#edit-profile-modal');
    const user = JSON.parse(this.dataset.user);

    showModal({ modal: editProfileModal, user });
  }

  function handleUpdatePassword() {
    const updatePswModal = document.querySelector('#update-password-modal');
    const user = JSON.parse(this.dataset.user);
    showModal({ modal: updatePswModal, user });
  }

  async function handleDeleteUser() {
    console.log('Handle delete user');

    let user;
    try {
      user = JSON.parse(this.dataset.user);
    } catch (error) {
      console.error('Invalid user data: ', error);
      return;
    }

    const confirmed = await confirmDeletion({ user });
    if (!confirmed) return;

    // Set up deleting state
    deleteUserButton.disabled = true;
    profile.classList.add('opacity-50');
    deleteUserButton.textContent = 'Deleting...';

    try {
      const url = `/users/${user.id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();

      // Handle api error (4xx, 5xx)
      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete user');
      }

      // Success
      window.location.href = '/users';
      showToast(result.message, 'success');
    } catch (error) {
      console.error('Failed to delete user: ', error);
      showToast(error.message || 'Error deleting user');

      // ONLY reset the UI if the operation FAILED.
      deleteUserButton.disabled = false;
      profile.classList.remove('opacity-50');
      deleteUserButton.textContent = 'Delete';
    }
  }
});
