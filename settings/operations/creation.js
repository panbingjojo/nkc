module.exports = {
  GET: 'creationCenter',
  drafts: {
    column:{
      GET:'creationCenter'
    },
    GET: 'creationCenter',
    POST: 'creationCenter',
    editor: {
      GET: 'creationCenter',
      POST: 'creationCenter',
    }
  },
  draft: {
    DELETE:'creationCenter',
  },
  category: {
    GET: 'creationCenter',
  },
  categories: {
    GET: 'creationCenter',
  },
  material: {
    PARAMETER: {
      GET: 'creationCenter',
      PUT: 'creationCenter',
      DELETE: 'creationCenter',
      editor: {
        POST: 'creationCenter'
      }
    }
  },
  materials: {
    GET: 'creationCenter',
    POST: 'creationCenter',
    DELETE: 'creationCenter',
    PUT: 'creationCenter',
    editor: {
      POST: 'creationCenter',
      GET: 'creationCenter',
    },
    document: {
      GET: 'creationCenter',
    },
    material: {
      POST: 'creationCenter',
    },
    del: {
      POST: 'creationCenter'
    },
    drag: {
      POST: 'creationCenter'
    }
  },
  books: {
    GET: 'creationCenter',
    editor: {
      GET: 'creationCenter',
      POST: 'creationCenter'
    }
  },
  book: {
    PARAMETER: {
      GET: 'creationCenter',
      list:{
        delete:{
          POST:'creationCenterDeleteList'
        },
        move:{
          POST:'creationCenterMoveList'
        },
        add:{
          POST:'creationCenterAddList'
        }
      },
      member: {
        POST: 'creationCenter',
        DELETE: 'creationCenter'
      },
    }
  },
  articles: {
    GET: 'creationCenter',
    editor: {
      GET: 'creationCenter',
      POST: 'creationCenter'
    },
    column: {
      GET: 'creationCenter',
      POST: 'creationCenter',
    }
  },
  article: {
    PARAMETER: {
      DELETE: 'creationCenter',
      draft: {
        DELETE: 'creationCenter'
      }
    }
  },
  column: {
    GET: 'creationCenter',
    article: {
      GET: 'creationCenter'
    },
    draft: {
      GET: 'creationCenter'
    },
  },
  community: {
    GET: 'creationCenter',
    thread: {
      GET: 'creationCenter'
    },
    post: {
      GET: 'creationCenter'
    },
    draft: {
      GET: 'creationCenter'
    },
    note: {
      GET: 'creationCenter'
    }
  },
  editor: {
    column: {
      GET: 'creationCenter'
    },
    community: {
      GET: 'creationCenter'
    },
    zone: {
      GET: 'creationCenter'
    },
    book: {
      GET: 'creationCenter'
    },
    draft: {
      GET: 'creationCenter'
    }
  }
}
