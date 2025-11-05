export function handleShowFileInfo(file) {
  document.querySelector('#modal-file-name').textContent = file.originalName;
  document.querySelector('#modal-file-size').textContent = file.fileSize;
  document.querySelector('#modal-file-type').textContent = file.mimeType;
  document.querySelector('#modal-file-date').textContent = file.uploadedAt;

  // Show thumbnail for images
  const previewDiv = document.querySelector('#modal-file-preview');
  if (file.mimeType.startsWith('image')) {
    previewDiv.innerHTML = `
      <div class="flex items-center justify-center">
        <img src="files/${file.id}/thumbnail" alt="File preview" />
      </div>
    `;
  }

  // Show resolution if available
  const resolutionContainer = document.getElementById(
    'modal-resolution-container',
  );
  if (file.width && file.height) {
    document.getElementById('modal-file-resolution').textContent =
      `${file.width} x ${file.height}`;
    resolutionContainer.classList.remove('hidden');
    resolutionContainer.classList.add('flex');
  } else {
    resolutionContainer.classList.remove('flex');
    resolutionContainer.classList.add('hidden');
  }
}
