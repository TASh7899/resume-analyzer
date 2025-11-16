import { Extension } from '@tiptap/core';

export const GlobalAttributes = Extension.create({
  name: 'globalAttributes',

  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'div',
          'span',
          'image',
          'listItem',
          'bulletList',
          'orderedList',
          'blockquote',
          'horizontalRule',
        ],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {};
              }
              return { style: attributes.style };
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {};
              }
              return { class: attributes.class };
            },
          },
        },
      },
    ];
  },
});
