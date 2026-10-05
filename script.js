const maxAttendance = 50;
const attendanceStorageKey = "intelSummitAttendance";
let attendeeCount = 0;
const attendees = [];

const teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

const checkInForm = document.getElementById("checkInForm");
const greeting = document.getElementById("greeting");
const attendeeCountDisplay = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const rosterCount = document.getElementById("rosterCount");

greeting.setAttribute("role", "status");
greeting.setAttribute("aria-live", "polite");

function loadAttendance() {
  let savedAttendance;

  try {
    savedAttendance = JSON.parse(localStorage.getItem(attendanceStorageKey));
  } catch (error) {
    return;
  }

  if (!savedAttendance || !savedAttendance.teamCounts) {
    return;
  }

  const savedTeamCounts = savedAttendance.teamCounts;
  const savedTeamTotal =
    savedTeamCounts.water + savedTeamCounts.zero + savedTeamCounts.power;

  if (
    Number.isInteger(savedAttendance.attendeeCount) &&
    savedAttendance.attendeeCount >= 0 &&
    savedAttendance.attendeeCount <= maxAttendance &&
    Number.isInteger(savedTeamCounts.water) &&
    savedTeamCounts.water >= 0 &&
    Number.isInteger(savedTeamCounts.zero) &&
    savedTeamCounts.zero >= 0 &&
    Number.isInteger(savedTeamCounts.power) &&
    savedTeamCounts.power >= 0 &&
    savedTeamTotal === savedAttendance.attendeeCount
  ) {
    attendeeCount = savedAttendance.attendeeCount;
    teamCounts.water = savedTeamCounts.water;
    teamCounts.zero = savedTeamCounts.zero;
    teamCounts.power = savedTeamCounts.power;
  }

  if (Array.isArray(savedAttendance.attendees)) {
    for (let index = 0; index < savedAttendance.attendees.length; index++) {
      const savedAttendee = savedAttendance.attendees[index];

      if (
        savedAttendee &&
        typeof savedAttendee.name === "string" &&
        teamNames[savedAttendee.team]
      ) {
        attendees.push({
          name: savedAttendee.name,
          team: savedAttendee.team,
        });
      }
    }
  }
}

function saveAttendance() {
  const attendanceData = {
    attendeeCount: attendeeCount,
    teamCounts: teamCounts,
    attendees: attendees,
  };

  localStorage.setItem(attendanceStorageKey, JSON.stringify(attendanceData));
}

function updateAttendanceDisplay() {
  attendeeCountDisplay.textContent = attendeeCount;
  progressBar.style.width = `${(attendeeCount / maxAttendance) * 100}%`;

  for (const team in teamCounts) {
    document.getElementById(`${team}Count`).textContent = teamCounts[team];
  }
}

function updateAttendeeList() {
  attendeeList.textContent = "";
  rosterCount.textContent = `${attendees.length} checked in`;

  if (attendees.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.className = "empty-roster";
    emptyCell.colSpan = 2;
    emptyCell.textContent =
      attendeeCount > 0
        ? "Names are unavailable for previously saved check-ins."
        : "No attendees checked in yet.";
    emptyRow.appendChild(emptyCell);
    attendeeList.appendChild(emptyRow);
    return;
  }

  for (let index = 0; index < attendees.length; index++) {
    const attendee = attendees[index];
    const attendeeRow = document.createElement("tr");
    const nameCell = document.createElement("td");
    const teamCell = document.createElement("td");

    nameCell.textContent = attendee.name;
    teamCell.textContent = teamNames[attendee.team];
    attendeeRow.appendChild(nameCell);
    attendeeRow.appendChild(teamCell);
    attendeeList.appendChild(attendeeRow);
  }
}

loadAttendance();
updateAttendanceDisplay();
updateAttendeeList();

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = document.getElementById("attendeeName").value.trim();
  const teamSelect = document.getElementById("teamSelect");
  const selectedTeam = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;

  if (attendeeCount >= maxAttendance) {
    greeting.textContent = `Check-in is full. We have reached ${maxAttendance} attendees.`;
    greeting.style.display = "block";
    greeting.classList.remove("success-message");
    return;
  }

  attendees.push({ name: attendeeName, team: selectedTeam });
  attendeeCount++;
  teamCounts[selectedTeam]++;

  updateAttendanceDisplay();
  updateAttendeeList();
  saveAttendance();

  if (attendeeCount === maxAttendance) {
    let highestTeamCount = 0;
    let winningTeams = [];

    for (const team in teamCounts) {
      if (teamCounts[team] > highestTeamCount) {
        highestTeamCount = teamCounts[team];
        winningTeams = [teamNames[team]];
      } else if (teamCounts[team] === highestTeamCount) {
        winningTeams.push(teamNames[team]);
      }
    }

    const winningTeamNames = winningTeams.join(" and ");
    const winnerDescription =
      winningTeams.length > 1 ? "are the winning teams" : "is the winning team";
    greeting.textContent = `Goal reached! Congratulations, ${winningTeamNames} ${winnerDescription} with ${highestTeamCount} attendees!`;
  } else {
    greeting.textContent = `Welcome, ${attendeeName}! You're checked in with ${teamName}.`;
  }

  greeting.style.display = "block";
  greeting.classList.add("success-message");

  checkInForm.reset();
});
