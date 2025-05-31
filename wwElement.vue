<template>
  <div id="gantt">
    <div class="gantt-container">
      <div class="gantt-labels">
        <div v-for="task in content.tasks" :key="task.name" class="gantt-label">
          {{ task.name }}
        </div>
      </div>

      <!-- Скроллируемая часть: календарь + шкалы -->
      <div class="gantt-scroll-container">
        <div class="gantt-calendar">
          <div id="gantt-months" class="gantt-months"></div>
          <div id="gantt-days" class="gantt-days"></div>
        </div>
        <div id="gantt-bars" class="gantt-rows"></div>
      </div>
    </div>
    <div id="tooltip" class="gantt-tooltip" style="display: none;"></div>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.renderGantt();
  },
  watch: {
    content: {
      deep: true,
      handler() {
        this.renderGantt();
      },
    },
  },
  methods: {
    formatDuration(ms) {
  if (!ms || ms <= 0) return "0 ч : 0 мин";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ч : ${minutes} мин`;
},

    renderGantt() {
      const tasks = this.content.tasks || [];
      const dayWidth = 40;

      const monthsDiv = this.$el.querySelector("#gantt-months");
      const daysDiv = this.$el.querySelector("#gantt-days");
      const rowsDiv = this.$el.querySelector("#gantt-bars");

      monthsDiv.innerHTML = "";
      daysDiv.innerHTML = "";
      rowsDiv.innerHTML = "";

      if (!tasks.length) return;

      const getAllDates = (tasks) => {
        let minDate = new Date(tasks[0].start);
        let maxDate = new Date(tasks[0].end);
        tasks.forEach((t) => {
          const sDate = new Date(t.start);
          const eDate = new Date(t.end);
          if (sDate < minDate) minDate = sDate;
          if (eDate > maxDate) maxDate = eDate;
        });

        const dateArray = [];
        const curr = new Date(minDate);
        while (curr <= maxDate) {
          dateArray.push(new Date(curr));
          curr.setDate(curr.getDate() + 1);
        }
        return dateArray;
      };

      const dates = getAllDates(tasks);

      

      // Месяцы
      let currentMonth = "";
      let monthStartIndex = 0;
      dates.forEach((date, i) => {
        const month = date.getMonth();
        if (month !== currentMonth) {
          if (i > 0) {
            const span = i - monthStartIndex;
            const monthDiv = document.createElement("div");
            monthDiv.className = "gantt-month";
            monthDiv.innerText = dates[monthStartIndex].toLocaleString("ru-RU", { month: "long" });
            monthDiv.style.width = `${span * dayWidth}px`;
            monthsDiv.appendChild(monthDiv);
            monthStartIndex = i;
          }
          currentMonth = month;
        }
        if (i === dates.length - 1) {
          const span = i - monthStartIndex + 1;
          const monthDiv = document.createElement("div");
          monthDiv.className = "gantt-month";
          monthDiv.innerText = dates[monthStartIndex].toLocaleString("ru-RU", { month: "long" });
          monthDiv.style.width = `${span * dayWidth}px`;
          monthsDiv.appendChild(monthDiv);
        }
      });

      // Дни
      const todayISO = new Date().toISOString().split("T")[0];
      dates.forEach((date) => {
        const dayDiv = document.createElement("div");
        dayDiv.className = "gantt-day";
        const iso = date.toISOString().split("T")[0];
        if (iso === todayISO) {
          dayDiv.classList.add("gantt-today");
        }
        dayDiv.innerText = `${date.getDate()}, ${date.toLocaleString("ru-RU", { weekday: "short" })}`;
        dayDiv.style.width = `${dayWidth}px`;
        daysDiv.appendChild(dayDiv);
      });

      // Шкалы задач
      tasks.forEach((task) => {
        const bar = document.createElement("div");
        bar.className = "gantt-bar";
        bar.style.backgroundColor = task.color || "#888";

        const tooltip = this.$el.querySelector("#tooltip");

bar.addEventListener("mouseenter", (e) => {
  tooltip.innerHTML = `
  <div><strong>${task.name}</strong></div>
  <div>Запланировано: ${this.formatDuration(task.hours)}</div>
  <div>Затрачено: ${this.formatDuration(task.worked_hours)}</div>
`;

  tooltip.style.display = "block";
});

bar.addEventListener("mousemove", (e) => {
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
});

bar.addEventListener("mouseleave", () => {
  tooltip.style.display = "none";
});


        const startIdx = dates.findIndex((d) => d.toISOString().split("T")[0] === task.start);
        const endIdx = dates.findIndex((d) => d.toISOString().split("T")[0] === task.end);
        const length = endIdx - startIdx + 1;

        bar.style.marginLeft = `${startIdx * dayWidth}px`;
        bar.style.width = `${length * dayWidth}px`;

        const row = document.createElement("div");
        row.className = "gantt-row";
        row.appendChild(bar);
        rowsDiv.appendChild(row);
      });
    },
  },
};
</script>

<style>
#gantt {
  font-family: sans-serif;
  padding: 10px;
}

.gantt-container {
  display: flex;
  flex-direction: row;
}

/* Левая колонка с названиями задач */
.gantt-labels {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  padding-top: 34px;
  background-color: #fafafa;
  border-right: 1px solid #ddd;
}

.gantt-label {
  height: 24px;
  padding: 4px 6px;
  font-size: 13px;
  
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  
}


.gantt-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: calc(100vw - 148px); /* учитываем ширину левой колонки с названиями */
  /* можно также задать фиксированную высоту, если нужно */
}

.gantt-calendar {
  display: flex;
  flex-direction: column;
  background-color: #eee;
}

.gantt-months,
.gantt-days {
  display: flex;
}

.gantt-month {
  font-size: 12px;
  text-align: left;
  color: #888;
}

.gantt-day {
  font-size: 11px;
  text-align: center;
  border-left: 1px solid #d9d9d9;
  background-color: #eee;
  height: 20px;
  line-height: 20px;
}

.gantt-today {
  background-color: #ffeb3b;
  border-bottom: 2px solid #f57c00;
  font-weight: bold;
}

.gantt-rows {
  display: flex;
  flex-direction: column;
}

.gantt-calendar,
.gantt-rows {
  min-width: max-content; /* минимальная ширина по содержимому */
}

.gantt-row {
  height: 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.gantt-bar {
  height: 16px;
  border-radius: 2px;
  margin-right: 4px;
  border-left: 1px solid #f1f1f1;
}

/* Скроллбар стили */
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgb(200, 200, 200);
  border-radius: 8px;
}

.gantt-tooltip {
  position: absolute;
  background: rgb(16, 16, 16, 0.9);
  border: 1px solid #ccc;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 18px;
  color: #eeeeee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  
}

</style>

       