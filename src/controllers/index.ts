import { RequestHandler } from 'express';

export const getHomepage: RequestHandler = (req, res, next) => {
  const items = [
    { category: 'folder', name: 'Books' },
    { category: 'folder', name: 'Code' },
    { category: 'folder', name: 'Music' },
    { category: 'folder', name: 'Video' },
    { category: 'folder', name: 'Tool' },
    { category: 'folder', name: 'Map' },
    { category: 'image', name: 'Flowers' },
    { category: 'video', name: 'Highlight' },
    { category: 'file', name: 'Notes' },
  ];

  res.render('index', { items });
};
