const { DH_NOT_SUITABLE_GENERATOR } = require("constants");
var fs = require("fs");
var readline = require("readline-sync");

class Main {
  constructor() {
    this.size = 0;
    this.table = new Timetable();
  }

  load_table(filename) {
    var data = fs.readFileSync(`${__dirname}\\dataset\\${filename}`, {
      encoding: "utf-8",
      flag: "r",
    });

    data = data.split("\r\n");
    for (var entry = 1; entry < data.length - 1; entry++) {
      var timetable_data = data[entry].split(",");
      ++this.size;

      timetable_data[0] = this.size;
      this.table.insert(...timetable_data);
    }
  }

  table_check() {
    //   initiate the size and table to empty, in the event that the user wants to load a new timetable
    this.size = 0;
    this.table.clear();

    console.clear();

    let file_list = [];
    var files = fs.readdirSync(`${__dirname}\\dataset`);
    files.forEach((file) => {
      if (file.substr(-4) == ".csv") file_list.push(file);
    });

    if (file_list.length == 0) {
      console.log("There are no timetables found in the dataset directory");
      return;
    }

    var choice_string = "0. All Files\n";
    for (var file = 0; file < file_list.length; file++) {
      choice_string += `${file + 1}. ${file_list[file]}\n`;
    }
    var choice = readline.question(choice_string);
    while (
      isNaN(choice) ||
      choice.length == 0 ||
      choice < 0 ||
      choice > file_list.length
    ) {
      console.clear();
      console.log(
        `Invalid Input. Enter an integer within the following range 0-${file_list.length}`
      );
      var choice = readline.question(choice_string);
    }

    if (choice == 0) {
      for (var table = 0; table < file_list.length; table++) {
        this.load_table(file_list[table]);
      }
    } else {
      this.load_table(file_list[choice - 1]);
    }
    // console.log(this.table);
    console.clear();

    // call function to check user needs
    this.main();
  }

  // main function that loops after first load of timetable
  main() {
    var choice_string =
      "0. Show Timetable\n1. Sort Timetable\n2. Load new Timetable\n3. Exit\n";
    var choice = readline.question(choice_string);
    while (isNaN(choice) || choice.length == 0 || choice < 0 || choice > 3) {
      console.clear();
      console.log(
        "Invalid Input. Enter an integer within the following range 0-3"
      );
      var choice = readline.question(choice_string);
    }

    // Case statements for each option
    switch (choice) {
      case "0":
        //   display timetable
        this.table.display();
        this.main();
        break;
      case "1":
        //   Display sort options
        console.log("1 has been chosen");
        this.main();
        break;
      case "2":
        //   Load new timetable file
        this.table_check();
        break;
      case "3":
        break;
    }
  }
}

class Entry {
  constructor(
    id,
    name,
    description,
    activity_date,
    scheduled_day,
    scheduled_start_time,
    scheduled_end_time,
    duration,
    allocated_location,
    planned_size,
    allocated_staff,
    zone
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.activity_date = activity_date;
    this.scheduled_day = scheduled_day;
    this.scheduled_start_time = scheduled_start_time;
    this.scheduled_end_time = scheduled_end_time;
    this.duration = duration;
    this.allocated_location = allocated_location;
    this.planned_size = planned_size;
    this.allocated_staff = allocated_staff;
    this.zone = zone;
  }
}

class Timetable {
  constructor() {
    this.entries = [];
  }

  clear() {
    this.entries = [];
  }

  insert(
    id,
    name,
    description,
    activity_date,
    scheduled_day,
    scheduled_start_time,
    scheduled_end_time,
    duration,
    allocated_location,
    planned_size,
    allocated_staff,
    zone
  ) {
    var entry = new Entry(
      id,
      name,
      description,
      activity_date,
      scheduled_day,
      scheduled_start_time,
      scheduled_end_time,
      duration,
      allocated_location,
      planned_size,
      allocated_staff,
      zone
    );

    this.entries.push(entry);
  }

  display() {
    console.clear();
    console.table(this.entries);
  }
}

var main = new Main();
main.table_check();
