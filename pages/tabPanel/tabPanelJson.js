var panelJson = [
  {
    "id": "1",
    "name":"顶级板块一",
    "son":[]
  },
  {
    "id": "2",
    "name":"顶级板块二",
    "son":[
      {
        "id": "5",
        "name":"二级子版块一",
        "son":[
          {
            "id": "8",
            "name":"三级子版块一",
            "son":[]
          },
          {
            "id": "9",
            "name":"三级子版块一",
            "son":[]
          }
        ]
      },
      {
        "id": "6",
        "name":"二级子版块二",
        "son":[]
      },
      {
        "id": "7",
        "name":"二级子版块三",
        "son":[
          {
            "id": "10",
            "name":"三级子版块一",
            "son":[]
          }
        ]
      }
    ]
  },
  {
    "id": "3",
    "name":"顶级板块三",
    "son":[
      {
        "id": "11",
        "name":"二级子版块四",
        "son":[]
      },
      {
        "id": "12",
        "name":"二级子版块五",
        "son":[]
      }
    ]
  },
  {
    "id": "4",
    "name":"顶级板块四",
    "son":[]
  }
];

window.panelJson = panelJson;