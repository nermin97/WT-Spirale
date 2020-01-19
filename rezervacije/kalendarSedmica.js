{
    const dayNames = ["PON", "UTO", "SRI", "CET", "PET", "SUB", "NED"];
    const monthNames = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
    let days = daysInMonth(currentMonth, currentYear);
    today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    endDay = 7;
    startDay = 0;
    week = 1;
    let firstDay;

    let monthAndYear = document.getElementById("monthAndYear-week");
    showCalendarWeek(currentMonth, currentYear);


    function nextWeek() {
        if (endDay == days) {
            currentMonth = (currentMonth + 1) % 12;
            currentYear = (currentMonth === 0) ? currentYear + 1 : currentYear;
            days = daysInMonth(currentMonth, currentYear);
            startDay = 0;
            endDay = 7;
            week = 1;
            showCalendar(currentMonth, currentYear);
        } else if (endDay + 7 > days) {
            startDay = endDay;
            endDay = days;
            week++;
        } else {
            startDay = endDay;
            endDay = endDay + 7;
            week++;
        }
        showCalendarWeek(currentMonth, currentYear);
    }

    function previousWeek() {
        if (endDay - 7 <= 0) {
            currentMonth = (currentMonth - 1 === -1) ? 12 : currentMonth - 1;
            currentYear = (currentMonth === 12) ? currentYear - 1 : currentYear;
            days = daysInMonth(currentMonth, currentYear);
            startDay = days - (firstDay % 7);
            endDay = days;
            week = weekCount(currentYear, currentMonth);
            showCalendar(currentMonth, currentYear);
        }
        else if (startDay - 7 <= 0) {
            startDay = 0;
            endDay = endDay - 7;
            week = 1;
        } else {
            startDay = startDay - 7;
            endDay = startDay;
            week--;
        }
        showCalendarWeek(currentMonth, currentYear);
    }

    function showCalendarWeek(month, year) {

        firstDay = (new Date(year, month)).getDay() - 1;
        if (firstDay === -1) firstDay = 6;

        // filing data about month and in the page via DOM.
        monthAndYear.innerHTML = monthNames[month] + ' ' + year;

        tbl = document.getElementById("calendar-body-week"); // body of the calendar

        // clearing all previous cells
        tbl.innerHTML = "";
        let date = startDay + 1;
        for (let i = 0; i < 7; i++) {
            // creates a table row
            let row = document.createElement("tr");

            //creating individual cells, filing them up with data.
            for (let j = 0; j < 2; j++) {

                if (j === 0) {
                    cell = document.createElement("td");
                    cellText = document.createTextNode(dayNames[i]);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                } else if (date > daysInMonth(month, year)) {
                    break;
                } else if (week != 1 || i >= firstDay) {
                    cell = document.createElement("td");
                    cell.style.cssText = "heigth: 12px; width: 75px"
                    cellText = document.createTextNode(date);
                    if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        cell.classList.add("bg-info");
                    } // color today's date
                    
                    cellChild = document.createElement("td");
                    cellChild.style.cssText = "width: 100%"
                    cell.appendChild(cellText);
                    cell.appendChild(cellChild);
                    if (i % 2 == 1) {
                        cell.classList.add("zauzeta");
                    } else {
                        cell.classList.add("slobodna");
                    }
                    row.appendChild(cell);
                    date++;
                }
                if (i == 6 && j == 1) {
                    endDay = date - 1;
                }

            }

            tbl.appendChild(row); // appending each row into calendar body.

        }
    }

    // check how many days in a month code from https://dzone.com/articles/determining-number-days-month
    function daysInMonth(iMonth, iYear) {
        return 32 - new Date(iYear, iMonth, 32).getDate();
    }

    function weekCount(year, month_number) {

        // month_number is in the range 1..12
    
        var firstOfMonth = new Date(year, month_number, 1);
        var lastOfMonth = new Date(year, month_number + 1, 0);
    
        var used = firstOfMonth.getDay() + 6 + lastOfMonth.getDate();
    
        return Math.ceil( used / 7);
    }
}