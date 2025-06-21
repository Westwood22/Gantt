<template>
    <div class="fullcalendar-wrapper modern-buttons" :style="calendarStyles">
        <FullCalendar ref="fullCalendarRef" :options="calendarOptions" :key="calendarKey" />

    </div>
</template>

<script>
import { ref, useTemplateRef, computed, watch, } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import luxonPlugin from '@fullcalendar/luxon3';






export default {
    components: {
        FullCalendar,
    },
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },

    
    emits: ['trigger-event'],
    setup(props, { emit }) {
        const fullCalendarRef = useTemplateRef(null);

        // Editor state
        const isEditing = computed(() => {
            /* wwEditor:start */
            return props.wwEditorState?.isEditing;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        });

        // Internal variables
        const { value: currentView, setValue: setCurrentView } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'currentView',
            type: 'string',
            defaultValue: computed(() => props.content.defaultView || 'dayGridMonth'),
        });

        const { value: selectedEvent, setValue: setSelectedEvent } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'selectedEvent',
            type: 'object',
            defaultValue: null,
        });

        const calendarKey = ref(Date.now());
        const showProjectStartIcon = computed(() => props.content?.showProjectStartIcon !== false); // true по умолчанию
        const projectStartIcon = computed(() => props.content?.projectStartIcon || '🚩');



        // Computed properties for styling
        const calendarStyles = computed(() => ({
            '--fc-font-family': props.content?.fontFamily || 'inherit',
            '--fc-font-size': props.content?.fontSize || '14px',
            '--fc-font-weight': props.content?.fontWeight || '400',
            '--fc-border-color': props.content?.borderColor || '#ddd',
            '--fc-button-text-color': props.content?.buttonTextColor || '#fff',
            '--fc-button-bg-color': props.content?.buttonBackgroundColor || '#2C3E50',
            '--fc-button-hover-bg-color': props.content?.buttonHoverBackgroundColor || '#1e2b37',
            '--fc-button-hover-text-color': props.content?.buttonHoverTextColor || '#fff',
            '--fc-button-active-bg-color': props.content?.buttonActiveBackgroundColor || '#1a252f',
            '--fc-button-active-text-color': props.content?.buttonActiveTextColor || '#fff',
            '--fc-button-border-radius': props.content?.buttonBorderRadius || '4px',
            '--fc-today-button-bg-color': props.content?.todayButtonBackgroundColor || null,
            '--fc-today-button-text-color': props.content?.todayButtonTextColor || null,
            '--fc-today-button-hover-bg-color': props.content?.todayButtonHoverBackgroundColor || null,
            '--fc-today-button-hover-text-color': props.content?.todayButtonHoverTextColor || null,
            '--fc-event-bg-color': props.content?.defaultEventBackgroundColor || '#3788d8',
            '--fc-event-border-color': props.content?.defaultEventBorderColor || '#3788d8',
            '--fc-event-text-color': props.content?.defaultEventTextColor || '#fff',
            '--fc-today-bg-color': props.content?.todayBackgroundColor || 'rgba(255, 220, 40, 0.15)',
            '--fc-now-indicator-color': props.content?.nowIndicatorColor || 'red',
            '--fc-header-height': props.content?.headerHeight || 'auto',
            '--fc-day-header-height': props.content?.dayHeaderHeight || 'auto',
            '--fc-header-bg-color': props.content?.headerBackgroundColor || null,
            '--fc-header-padding': props.content?.headerBackgroundColor ? '10px' : '0px',
            '--fc-header-text-color': props.content?.headerTextColor || null,
            '--fc-day-header-bg-color': props.content?.dayHeaderBackgroundColor || null,
            '--fc-day-header-text-color': props.content?.dayHeaderTextColor || null,
            '--fc-day-header-font-size': props.content?.dayHeaderFontSize || null,
            '--fc-day-header-font-weight': props.content?.dayHeaderFontWeight || null,
            '--fc-cell-bg-color': props.content?.cellBackgroundColor || null,
            '--fc-cell-text-color': props.content?.cellTextColor || null,
            '--fc-time-grid-bg-color': props.content.timeGridBackgroundColor || null,
            '--fc-other-month-bg-color': props.content?.otherMonthBackgroundColor || null,
            '--fc-other-month-text-color': props.content?.otherMonthTextColor || null,
            '--fc-weekend-text-color': props.content?.weekendTextColor || null,
        }));




        // Process events data with property path mapping
        const processedEvents = computed(() => {
            const events = props.content?.events || [];
            const { resolveMappingFormula } = wwLib.wwFormula.useFormula();

            const result = events.map(event => {
                // Get values using formulas
                const id = resolveMappingFormula(props.content?.eventsIdFormula, event) ?? event.id;
                const title = resolveMappingFormula(props.content?.eventsTitleFormula, event) ?? event.title;
                const start = resolveMappingFormula(props.content?.eventsStartFormula, event) ?? event.start;
                const end = resolveMappingFormula(props.content?.eventsEndFormula, event) ?? event.end;
                const allDay = resolveMappingFormula(props.content?.eventsAllDayFormula, event) ?? event.allDay;
                const backgroundColor = resolveMappingFormula(props.content?.eventsBackgroundColorFormula, event) ?? event.backgroundColor;
                const borderColor = resolveMappingFormula(props.content?.eventsBorderColorFormula, event) ?? event.borderColor;
                const textColor = resolveMappingFormula(props.content?.eventsTextColorFormula, event) ?? event.textColor;
                const content = resolveMappingFormula(props.content?.eventsContentFormula, event) ?? event.content;
                const data = resolveMappingFormula(props.content?.eventsDataFormula, event) ?? event;
                const groupId = resolveMappingFormula(props.content?.eventsGroupIdFormula, event) ?? event.groupId;
                const user = resolveMappingFormula(props.content?.eventsUserFormula, event) ?? event.user;
                const duration = resolveMappingFormula(props.content?.eventsDurationFormula, event) ?? event.duration;
                const height = duration ? `${(duration / 3600000) * 24}px` : undefined;
                const type = resolveMappingFormula(props.content?.eventsTypeFormula, event) ?? event.type;
                const projectId = data?.project?.id ?? data?.project_id ?? event.project?.id ?? event.project_id ?? null;
                const client = resolveMappingFormula(props.content?.eventsClientFormula, event) ?? data?.client ?? event?.client ?? event?.lead?.client;

                return {
                    id: id || wwLib.wwUtils.getUid(),
                    title: title || 'Untitled Event',
                    start: start,
                    end: end,
                    allDay: allDay,
                    backgroundColor: backgroundColor || props.content?.defaultEventBackgroundColor || '#3788d8',
                    borderColor: borderColor || props.content?.defaultEventBorderColor || '#3788d8',
                    textColor: textColor || props.content?.defaultEventTextColor || '#ffffff',
                    ...(groupId ? { groupId: groupId || undefined } : {}),
                    projectId,
                    extendedProps: {
                        content: content || '',
                        data: data || {},
                        originalEvent: event,
                        duration: duration,
                        type: type,
                        user: user,
                        height: height,
                        client: client || 'null',
                    },
                };
            });
            console.log('processedEvents', result); // <--- тут лог
            return result; // <--- и только теперь return
        })



        function getDateKey(d) {
            if (!d) return '';
            const date = new Date(d);
            return [
                date.getFullYear(),
                (date.getMonth() + 1).toString().padStart(2, '0'),
                date.getDate().toString().padStart(2, '0')
            ].join('-');
        }

        // 1. Собираем карту дат начала проектов
        const projectStartDates = computed(() => {
            const events = processedEvents.value;
            const grouped = {};
            // Группируем только по projectId
            for (const e of events) {
                if (!e.projectId || !e.start) continue;
                if (!grouped[e.projectId]) grouped[e.projectId] = [];
                grouped[e.projectId].push(e);
            }
            const map = new Map();
            for (const evts of Object.values(grouped)) {
                const sorted = evts.sort((a, b) => new Date(a.start) - new Date(b.start));
                const key = getDateKey(sorted[0].start);
                map.set(key, true);
            }

            return map;
        });

        // Available calendar views
        const availableViews = computed(() => {
            const views = {};

            if (props.content?.yearView) {
                views.multiMonthYear = { type: 'multiMonth', duration: { year: 1 } };
            }

            if (props.content?.monthView) {
                views.dayGridMonth = { type: 'dayGrid', duration: { month: 1 } };
            }

            if (props.content?.weekView) {
                views.timeGridWeek = { type: 'timeGrid', duration: { week: 1 } };
            }

            if (props.content?.dayView) {
                views.timeGridDay = { type: 'timeGrid', duration: { day: 1 } };
            }

            if (props.content?.listView) {
                views.listWeek = { type: 'list', duration: { week: 1 } };
            }

            return views;
        });






        // Computed properties for calendar options
        const calendarOptions = computed(() => {
            const firstDay = props.content?.startWeekOnSunday ? 0 : 1;
            const locale = props.content?.locale === 'auto' ? wwLib.wwLang.lang : props.content?.locale || 'en';


            // Validate default view
            let initialView = currentView;
            const validViews = ['multiMonthYear', 'dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'];
            if (!validViews.includes(initialView)) {
                initialView = 'dayGridMonth';
            }

            // Validate time start and end
            let slotMinTime = '00:00:00';
            let slotMaxTime = '24:00:00';

            if (props.content?.timeStart) {
                // Simple validation for time format (HH:MM:SS)
                const timeStartRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
                if (timeStartRegex.test(props.content.timeStart)) {
                    slotMinTime = props.content.timeStart;
                }
            }

            if (props.content?.timeEnd) {
                // Simple validation for time format (HH:MM:SS)
                const timeEndRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
                if (timeEndRegex.test(props.content.timeEnd)) {
                    slotMaxTime = props.content.timeEnd;
                }
            }

            // Handle height and contentHeight settings
            let height = props.content?.height || '600px';
            let contentHeight = props.content?.contentHeight || 'auto';

            // If height is 'auto', set it to null to let FullCalendar handle it
            if (height === 'auto') {
                height = null;
            }

            // If contentHeight is 'auto', set it to null to let FullCalendar handle it
            if (contentHeight === 'auto') {
                contentHeight = null;
            }

            // Custom button text
            const buttonText = {};
            if (props.content?.buttonTextToday) buttonText.today = wwLib.wwLang.getText(props.content.buttonTextToday);
            if (props.content?.buttonTextYear) buttonText.year = wwLib.wwLang.getText(props.content.buttonTextYear);
            if (props.content?.buttonTextMonth) buttonText.month = wwLib.wwLang.getText(props.content.buttonTextMonth);
            if (props.content?.buttonTextWeek) buttonText.week = wwLib.wwLang.getText(props.content.buttonTextWeek);
            if (props.content?.buttonTextDay) buttonText.day = wwLib.wwLang.getText(props.content.buttonTextDay);
            if (props.content?.buttonTextList) buttonText.list = wwLib.wwLang.getText(props.content.buttonTextList);

            return {
                plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin, luxonPlugin],
                initialView: initialView,

                dayCellDidMount(info) {
                    const dayIndex = info.date.getDay();
                    const blockedDays = props.content?.hideDaysOfWeek || [];
                    const isBlocked = props.content?.hideWeekends
                        ? [0, 6].includes(dayIndex) || blockedDays.includes(dayIndex)
                        : blockedDays.includes(dayIndex);

                    if (isBlocked) {
                        // не добавляем кнопку для заблокированных дней
                        return;
                    }

                    // Вставляем кнопку только если день не заблокирован
                    const button = document.createElement('button');
                    button.innerText = '+';
                    button.classList.add('day-cell-button');
                    info.el.style.position = 'relative';
                    button.style.position = 'absolute';
                    button.style.top = '2px';
                    button.style.right = '2px';
                    button.style.zIndex = '10';

                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        emit('trigger-event', {
                            name: 'cellButtonClick',
                            event: {
                                value: info.dateStr,
                                toggle: true,
                            }
                        });
                    });

                    info.el.appendChild(button);
                },

                dayCellClassNames(info) {
                    const dayIndex = info.date.getDay();
                    const blockedDays = props.content?.hideDaysOfWeek || [];
                    const isBlocked = props.content?.hideWeekends
                        ? [0, 6].includes(dayIndex) || blockedDays.includes(dayIndex)
                        : blockedDays.includes(dayIndex);

                    return isBlocked ? ['blocked-day'] : [];
                },



                eventContent: function (arg) {
    const userAvatar = arg.event.extendedProps?.user?.avatar?.url;
    const eventType = arg.event.extendedProps?.type;
    const durationMs = arg.event.extendedProps?.duration;
    const height = arg.event.extendedProps?.height;
    const eventData = arg.event.extendedProps?.data || {};
    const eventProject = eventData?.project || {};
    const client = arg.event.extendedProps?.client || {};
    const clientFullName = [client.firstname, client.surname].filter(Boolean).join(' ');

    // --- исправлено: используем let ---
    let eventTitle = 'Без названия';
    let backgroundColor = arg.event.backgroundColor || '#ffffff';
    let fontColor = '#000';

    // === Отдельная обработка для "Отсутствие" ===
    if (eventType === 'unavailable') {
        eventTitle = 'Отсутствие';
        backgroundColor = '#d3d3d3'; // любой серый
        fontColor = '#333';
    } else if (eventType === 'task') {
        eventTitle = eventData?.task?.name || 'Без названия задачи';
    } else if (eventType === 'work' || eventType === 'call') {
        eventTitle = eventProject?.title || 'Без названия проекта';
    } else if (eventType === 'negotiation_call') {
        eventTitle = clientFullName || 'Созвон';
    } else {
        eventTitle = arg.event.title || 'Без названия';
    }

    const isCall = eventType === 'call' || eventType === 'negotiation_call';
    let timePrefix = '';
    if (isCall && arg.event.start) {
        const date = new Date(arg.event.start);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        timePrefix = `${hours}:${minutes} — `;
    }

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'flex-start';
    container.style.width = '100%';
    container.style.height = height || '24px';
    container.style.justifyContent = 'space-between';
    container.style.backgroundColor = backgroundColor;
    container.style.color = fontColor;
    container.style.padding = '2px 4px';
    container.style.borderRadius = '4px';

    const leftSection = document.createElement('div');
    leftSection.style.display = 'flex';
    leftSection.style.alignItems = 'center';
    leftSection.style.gap = '6px';
    leftSection.style.flex = '1';
    leftSection.style.overflow = 'hidden';

    // Показываем аватар только если это не "Отсутствие"
    if (userAvatar && eventType !== 'unavailable') {
        const img = document.createElement('img');
        img.src = userAvatar;
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.borderRadius = '50%';
        leftSection.appendChild(img);
    }

    if (isCall) {
        const icon = document.createElement('span');
        icon.innerText = '📞';
        leftSection.appendChild(icon);
    }

    const titleSpan = document.createElement('span');
    titleSpan.innerText = `${timePrefix}${eventTitle}`;
    titleSpan.style.fontSize = '13px';
    titleSpan.style.color = fontColor;
    titleSpan.style.whiteSpace = 'nowrap';
    titleSpan.style.overflow = 'hidden';
    titleSpan.style.textOverflow = 'ellipsis';
    titleSpan.style.flexGrow = '1';
    titleSpan.style.minWidth = '0';
    leftSection.appendChild(titleSpan);

    container.appendChild(leftSection);

    // Правая часть: длительность
    if (durationMs) {
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        const durationText = [];
        if (hours > 0) durationText.push(`${hours}ч`);
        if (minutes > 0) durationText.push(`${minutes}м`);

        if (durationText.length) {
            const durationEl = document.createElement('span');
            durationEl.innerText = durationText.join(' ');
            durationEl.style.fontSize = '13px';
            durationEl.style.color = '#666';
            durationEl.style.paddingTop = '3px';
            container.appendChild(durationEl);
        }
    }

    return { domNodes: [container] };
},



                headerToolbar: props.content?.showHeader ? {
                    left: 'prev,next today',
                    center: 'title',
                    right: Object.keys(availableViews.value).join(','),
                } : false,
                views: availableViews.value,
                events: processedEvents.value,
                editable: !props.content?.disableInteractions && !isEditing.value,
                selectable: !props.content?.disableInteractions && !isEditing.value,
                selectMirror: true,
                dayMaxEvents: true,
                weekends: !props.content?.hideWeekends,
                firstDay: firstDay,
                locale: locale,
                timeZone: props.content?.timezone || 'local',
                //hiddenDays: hiddenDays.value,
                slotMinTime: slotMinTime,
                slotMaxTime: slotMaxTime,
                allDaySlot: props.content?.allDaySlot,
                nowIndicator: true,
                height: 'auto',
                contentHeight: 'auto',
                stickyHeaderDates: true,
                noEventsContent: props.content?.noEventsText ? wwLib.wwLang.getText(props.content.noEventsText) : undefined,
                buttonText: Object.keys(buttonText).length > 0 ? buttonText : undefined,



                // Добавлене флага — начало проекта
                // 2. Проверяем в dayCellContent: совпадает ли день с датой старта проекта?


                dayCellContent: function (arg) {
                    const key = getDateKey(arg.date);
                    const isProjectStart = projectStartDates.value.has(key);

                    // Используй настройки для отображения иконки
                    let icon = '';
                    if (isProjectStart && showProjectStartIcon.value) {
                        icon = projectStartIcon.value;
                    }
                    return {
                        html: `${arg.dayNumberText} ${icon}`
                    };
                },





                // Add all event handlers directly to the options object
                eventClick: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        ...info.event.extendedProps.originalEvent,
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        groupId: info.event.groupId,
                    };

                    setSelectedEvent(eventData);

                    emit('trigger-event', {
                        name: 'eventClick',
                        event: { value: eventData },
                    });
                },
                datesSet: info => {
                    if (isEditing.value) return;

                    const viewData = {
                        view: info.view.type,
                        start: info.view.activeStart?.toISOString(),
                        end: info.view.activeEnd?.toISOString(),
                        title: info.view.title,
                    };

                    setCurrentView(info.view.type);

                    emit('trigger-event', {
                        name: 'viewChange',
                        event: { value: viewData },
                    });
                },
                select: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        start: info.start?.toISOString(),
                        end: info.end?.toISOString(),
                        allDay: info.allDay,
                    };

                    emit('trigger-event', {
                        name: 'eventCreated',
                        event: { value: eventData },
                    });
                },
                eventChange: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        ...info.event.extendedProps,
                    };

                    emit('trigger-event', {
                        name: 'eventUpdated',
                        event: { value: eventData },
                    });
                },
                eventDragStart: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        ...info.event.extendedProps,
                    };

                    emit('trigger-event', {
                        name: 'eventDragStart',
                        event: { value: eventData },
                    });
                },
                eventDragStop: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        ...info.event.extendedProps,
                    };

                    emit('trigger-event', {
                        name: 'eventDragEnd',
                        event: { value: eventData },
                    });
                },
                eventDrop: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        delta: info.delta,
                        ...info.event.extendedProps,
                    };

                    emit('trigger-event', {
                        name: 'eventDrop',
                        event: { value: eventData },
                    });
                },
                eventResizeStart: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        ...info.event.extendedProps,
                    };

                    emit('trigger-event', {
                        name: 'eventResizeStart',
                        event: { value: eventData },
                    });
                },
                eventResize: info => {
                    if (isEditing.value || props.content?.disableInteractions) return;

                    const eventData = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        allDay: info.event.allDay,
                        startDelta: info.startDelta,
                        endDelta: info.endDelta,
                        ...info.event.extendedProps,
                    };

                    emit('trigger-event', {
                        name: 'eventResize',
                        event: { value: eventData },
                    });
                },
            };
        });

        // Watch for changes in content properties
        watch(
            () => props.content?.defaultView,
            newVal => {
                let viewMode = newVal
                const validViews = ['multiMonthYear', 'dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'];
                if (!validViews.includes(newVal)) {
                    viewMode = 'dayGridMonth';
                }
                if (viewMode && fullCalendarRef.value) {
                    const calendarApi = fullCalendarRef.value.getApi();
                    calendarApi.changeView(viewMode);
                    setCurrentView(viewMode);
                }
            }
        );

        watch(
            () => props.content?.timezone,
            () => {
                if (fullCalendarRef.value) {
                    const calendarApi = fullCalendarRef.value.getApi();
                    calendarApi.refetchEvents();
                }
            }
        );

        watch(
            [
                () => props.content?.hideDaysOfWeek,
                () => props.content?.hideWeekends,
                () => props.content?.showProjectStartIcon,
                () => props.content?.projectStartIcon
            ],
            () => {
                calendarKey.value = Date.now(); // уникальное значение, чтобы Vue смонтировал компонент заново
            }
        );



        // Actions
        const changeView = viewName => {
            if (fullCalendarRef.value) {
                const calendarApi = fullCalendarRef.value.getApi();
                calendarApi.changeView(viewName);
                setCurrentView(viewName);
            }
        };

        const goToDate = date => {
            if (fullCalendarRef.value) {
                const calendarApi = fullCalendarRef.value.getApi();
                calendarApi.gotoDate(date);
            }
        };

        const next = () => {
            if (fullCalendarRef.value) {
                const calendarApi = fullCalendarRef.value.getApi();
                calendarApi.next();
            }
        };

        const prev = () => {
            if (fullCalendarRef.value) {
                const calendarApi = fullCalendarRef.value.getApi();
                calendarApi.prev();
            }
        };

        const today = () => {
            if (fullCalendarRef.value) {
                const calendarApi = fullCalendarRef.value.getApi();
                calendarApi.today();
            }
        };

        return {
            fullCalendarRef,
            calendarKey,
            calendarOptions,
            calendarStyles,
            currentView,
            selectedEvent,
            // Actions
            changeView,
            goToDate,
            next,
            prev,
            today,
        };
    },
};


</script>

<style lang="scss" scoped>
.fullcalendar-wrapper {
    width: 100%;

    --fc-border-color: #ddd;
    --fc-button-text-color: #fff;
    --fc-button-bg-color: #2c3e50;
    --fc-button-border-color: #2c3e50;
    --fc-button-hover-bg-color: #1e2b37;
    --fc-button-hover-border-color: #1a252f;
    --fc-button-active-bg-color: #1a252f;
    --fc-button-active-border-color: #151e27;
    --fc-event-bg-color: #3788d8;
    --fc-event-border-color: #3788d8;
    --fc-event-text-color: #fff;
    --fc-event-text-color: #fff;
    --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);
    --fc-more-link-bg-color: #d0d0d0;
    --fc-more-link-text-color: inherit;
    --fc-today-bg-color: rgba(255, 220, 40, 0.15);
    --fc-now-indicator-color: red;
    --fc-header-height: auto;
    --fc-day-header-height: auto;
    position: relative;
    overflow: auto;

    &.dark-mode {
        --fc-border-color: #444;
        --fc-button-text-color: #fff;
        --fc-button-bg-color: #444;
        --fc-button-border-color: #444;
        --fc-button-hover-bg-color: #555;
        --fc-button-hover-border-color: #555;
        --fc-button-active-bg-color: #666;
        --fc-button-active-border-color: #666;
        --fc-page-bg-color: #222;
        --fc-neutral-bg-color: #333;
        --fc-neutral-text-color: #fff;
        --fc-today-bg-color: rgba(255, 220, 40, 0.1);

        :deep(.fc) {
            color: #fff;


            .fc-toolbar-title {
                color: #fff;
            }

            .fc-col-header-cell {
                background-color: var(--fc-day-header-bg-color, #333) !important;
            }

            .fc-daygrid-day {
                background-color: var(--fc-cell-bg-color, #222) !important;
                height: 200px;
            }

            .fc-day-other {
                background-color: var(--fc-other-month-bg-color, #1a1a1a) !important;
                color: var(--fc-other-month-text-color, #888) !important;
            }

            .fc-list-day-cushion {
                background-color: #333;
            }

        }
    }

    :deep(.blocked-day) {
        background: #eeeeee !important; // Светло-серый фон
    }

    :deep(td.blocked-day),
    :deep(td.blocked-day .fc-daygrid-day-frame),
    :deep(td.blocked-day .fc-daygrid-day-top),
    :deep(td.blocked-day .fc-daygrid-day-number) {
        background: #f9f9fc !important;
        color: #8a9099 !important;
    }

    :deep(.fc) {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        font-family: var(--fc-font-family);
        font-size: var(--fc-font-size);
        font-weight: var(--fc-font-weight);




        .fc-event,
        .fc-h-event,
        .fc-daygrid-event {
            box-sizing: border-box !important;
            padding: 1px 3px !important; // 👈 безопасные внутренние отступы
            margin: 0 !important; // ❗ убираем внешний margin
            border: none !important;
            background-color: #fff !important;
            color: var(--fc-event-text-color) !important;
        }

        .fc-event:hover {
            box-shadow: none !important;
            transform: none !important;
            padding: 1px 3px !important; // 👈 одинаковый padding при hover
        }


        .fc-event-hover,
        .fc-highlight {
            all: unset !important;
        }



        .fc-event {
            cursor: pointer;


        }

        .fc-toolbar-title {
            font-size: var(--fc-font-size);
            font-weight: var(--fc-font-weight);
            color: var(--fc-header-text-color);
        }

        .fc-button {
            font-size: var(--fc-font-size);
            padding: 0.4em 0.65em;
            border-radius: var(--fc-button-border-radius);
        }

        .fc-header-toolbar {
            background-color: var(--fc-header-bg-color);
            padding: var(--fc-header-padding);
            height: var(--fc-header-height);
        }

        // Fix for day header vertical alignment and background
        .fc-col-header-cell {
            height: var(--fc-day-header-height);
            background-color: var(--fc-day-header-bg-color) !important;


            .fc-col-header-cell-cushion {
                display: flex;
                align-items: center;
                justify-content: center;
                height: var(--fc-day-header-height);
                padding: 8px;
                color: var(--fc-day-header-text-color);
                font-size: var(--fc-day-header-font-size);
                font-weight: var(--fc-day-header-font-weight);
            }
        }

        .fc-timegrid-axis {
            background-color: var(--fc-day-header-bg-color) !important;

        }

        // Fix for today background in all views
        .fc-day-today {
            background-color: var(--fc-today-bg-color) !important;
        }

        // Fix for cell backgrounds and text colors
        .fc-daygrid-day {
            background-color: var(--fc-cell-bg-color) !important;
            color: var(--fc-cell-text-color) !important;
            height: 180px !important;
        }



        // Fix for other month cells
        .fc-day-other {
            background-color: var(--fc-other-month-bg-color) !important;


        }

        .fc-daygrid-day-top,
        .fc-daygrid-day-number {
            color: var(--fc-other-month-text-color) !important;
            float: none !important;
            text-align: left !important;
            display: block !important;
            margin: 0 !important;
            padding: 3px 2px 2px 3px !important;


        }

        // Weekend text color
        .fc-day-sat,
        .fc-day-sun {

            .fc-daygrid-day-top,
            .fc-daygrid-day-number,
            .fc-col-header-cell-cushion {
                color: var(--fc-weekend-text-color) !important;



            }
        }

        // Fix for time grid background
        .fc-timegrid-cols,
        .fc-timegrid-col,
        .fc-timegrid-body {
            background-color: var(--fc-time-grid-bg-color) !important;
        }

        // Fix for today button styling to use its own colors
        .fc-today-button {
            text-transform: capitalize;
            background: var(--fc-today-button-bg-color, var(--fc-button-bg-color));
            color: var(--fc-today-button-text-color, var(--fc-button-text-color));
            border: none;

            &:hover {
                background-color: var(--fc-today-button-hover-bg-color, var(--fc-button-hover-bg-color));
                border-color: var(--fc-button-hover-border-color);
                color: var(--fc-today-button-hover-text-color, var(--fc-button-hover-text-color));
            }
        }

        // Fix for today highlighting in all views
        .fc-day.fc-day-today,
        .fc-daygrid-day.fc-day-today,
        .fc-timegrid-col.fc-day-today,
        .fc-list-day.fc-day-today {
            background-color: var(--fc-today-bg-color) !important;
        }

        // Additional styles for multimonth view (year view)
        .fc-multimonth-daygrid-table {
            .fc-day-today {
                background-color: var(--fc-today-bg-color) !important;
            }
        }
    }
}

.fullcalendar-wrapper.modern-buttons {
    :deep(.fc) {
        .fc-button {
            box-shadow: none;
        }

        .fc-button-group {
            background-color: var(--fc-button-bg-color);
            color: var(--fc-button-text-color);
            padding: 2px;
            border-radius: var(--fc-button-border-radius);

            .fc-button {
                color: var(--fc-button-text-color);
                border: none;
                box-shadow: none;
                text-transform: capitalize;

                &:hover {
                    background-color: var(--fc-button-hover-bg-color);
                    border-radius: var(--fc-button-border-radius);
                    color: var(--fc-button-hover-text-color);
                }

                &.fc-button-active {
                    background-color: var(--fc-button-active-bg-color);
                    border-radius: var(--fc-button-border-radius);
                    color: var(--fc-button-active-text-color);
                    box-shadow: none;
                }
            }
        }

        .fc-toolbar-title {
            font-size: var(--fc-font-size);
            font-weight: var(--fc-font-weight);
            color: var(--fc-header-text-color);
        }

        .fc-toolbar {
            background-color: var(--fc-header-bg-color);
            padding: var(--fc-header-padding);
        }

        .fc-prev-button,
        .fc-next-button {
            background: transparent;
            color: var(--fc-button-text-color);

            &:hover {
                background-color: var(--fc-button-hover-bg-color);
                color: var(--fc-button-hover-text-color);
            }
        }

        .day-cell-button {
            position: absolute;
            top: 0px;
            right: 2px;
            color: #000000;
            padding: 0px 4px;
            font-size: 24px;
            font-weight: 200;
            line-height: 24px;
            background-color: #fff;
            opacity: 0;
            transition: opacity 0.3s;
            cursor: pointer;
        }

        :deep(.blocked-day .day-cell-button) {
            display: none !important;
        }

        .fc-daygrid-day:hover .day-cell-button {
            opacity: 50;
        }
    }
}

:deep(.fc-daygrid-event-harness) {
    margin-bottom: 0.5px !important; // 👈 имитация gap между событиями
}
</style>
