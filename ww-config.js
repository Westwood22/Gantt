export default {
  editor: {
    label: {
      en: "Gantt Chart",
      fr: "Diagramme de Gantt"
    },
    icon: "calendar-range",
  },
  properties: {
    tasks: {
      label: {
        en: "Tasks",
        fr: "Tâches"
      },
      type: "array",
      bindable: true,
      defaultValue: [
        {
          name: "Анализ",
          start: "2025-04-28",
          end: "2025-05-04",
          color: "#4caf50"
        },
        {
          name: "Разработка",
          start: "2025-05-05",
          end: "2025-05-18",
          color: "#2196f3"
        }
      ],
    },
    
  }
};
