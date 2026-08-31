/* =========================================================
   ENGLISH WITH MARIAMI
   GRADE 2 FUTURISTIC DASHBOARD
========================================================= */

(function () {

  "use strict";


  /* =======================================================
     LESSON DATA
  ======================================================= */

  const lessons = [

    {
      number: "01",
      title: "Animals",
      theme: "Hologram Zoo",
      icon: "🐾"
    },

    {
      number: "02",
      title: "Numbers",
      theme: "Space Numbers",
      icon: "🔢"
    },

    {
      number: "03",
      title: "Colors",
      theme: "Neon Color Lab",
      icon: "🎨"
    },

    {
      number: "04",
      title: "Family",
      theme: "Family Galaxy",
      icon: "👨‍👩‍👧"
    },

    {
      number: "05",
      title: "Home",
      theme: "Smart Home",
      icon: "🏠"
    },

    {
      number: "06",
      title: "Food",
      theme: "Food Planet",
      icon: "🍎"
    },

    {
      number: "07",
      title: "Clothes",
      theme: "Fashion Station",
      icon: "👕"
    },

    {
      number: "08",
      title: "Weather",
      theme: "Weather Lab",
      icon: "🌦️"
    },

    {
      number: "09",
      title: "School",
      theme: "Future School",
      icon: "🎒"
    },

    {
      number: "10",
      title: "Transport",
      theme: "Transport Zone",
      icon: "🚀"
    },

    {
      number: "11",
      title: "Nature",
      theme: "Nature World",
      icon: "🌳"
    },

    {
      number: "12",
      title: "Review",
      theme: "Final Challenge",
      icon: "🏆"
    }

  ];


  /* =======================================================
     DASHBOARD SETTINGS
  ======================================================= */

  const dashboardData = {

    xp: 120,

    streak: 7,

    badges: 4,

    progress: 34

  };


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const lessonGrid =
    document.getElementById("lessonGrid");

  const xpValue =
    document.getElementById("xpValue");

  const streakValue =
    document.getElementById("streakValue");

  const badgeValue =
    document.getElementById("badgeValue");

  const progressText =
    document.getElementById("progressText");

  const progressBar =
    document.getElementById("progressBar");


  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  function loadDashboard() {

    if (xpValue) {

      xpValue.textContent =
        dashboardData.xp;

    }


    if (streakValue) {

      streakValue.textContent =
        dashboardData.streak;

    }


    if (badgeValue) {

      badgeValue.textContent =
        dashboardData.badges;

    }


    if (progressText) {

      progressText.textContent =
        dashboardData.progress + "%";

    }


    if (progressBar) {

      progressBar.style.width =
        dashboardData.progress + "%";

    }

  }


  /* =======================================================
     OPEN LESSON
  ======================================================= */

  function openLesson(number) {

    const lesson =
      lessons.find(function (item) {

        return item.number === number;

      });


    if (!lesson) {

      return;

    }


    /*
      ======================================================
      IMPORTANT

      აქ შემდეგ ეტაპზე ჩავანაცვლებთ alert-ს
      შენი რეალური Lesson ფაილის მისამართით.

      მაგალითად:

      window.location.href =
        "lessons/lesson01/index.html";

      ან:

      window.location.href =
        "lesson1.html";

      ======================================================
    */


    console.log(
      "Opening Grade 2 lesson:",
      lesson
    );


    alert(
      "Grade 2\n\n" +
      "Lesson " +
      lesson.number +
      ": " +
      lesson.title +
      "\n\n" +
      lesson.theme
    );

  }


  /* =======================================================
     CARD EVENTS
  ======================================================= */

  if (lessonGrid) {

    lessonGrid.addEventListener(
      "click",
      function (event) {

        const card =
          event.target.closest(
            "[data-lesson]"
          );


        if (!card) {

          return;

        }


        const lessonNumber =
          card.dataset.lesson;


        openLesson(
          lessonNumber
        );

      }
    );

  }


  /* =======================================================
     BUTTON KEYBOARD SUPPORT
  ======================================================= */

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Escape") {

        return;

      }

      console.log(
        "Escape pressed"
      );

    }
  );


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.Grade2Dashboard = {

    lessons: lessons,

    data: dashboardData,

    openLesson: openLesson,

    setProgress: function (value) {

      let progress =
        Number(value);


      if (
        Number.isNaN(progress)
      ) {

        return;

      }


      progress =
        Math.max(
          0,
          Math.min(
            100,
            progress
          )
        );


      dashboardData.progress =
        progress;


      loadDashboard();

    }

  };


  /* =======================================================
     START
  ======================================================= */

  loadDashboard();


})();
