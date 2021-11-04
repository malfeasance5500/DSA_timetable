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

    console.clear();

    // Case statements for each option
    switch (choice) {
      case "0":
        //   display timetable
        this.table.display();
        this.main();
        break;
      case "1":
        //   Display sort options
        this.sort_options();
        this.table.display();
        this.main();
        break;
      case "2":
        //   Load new timetable file
        this.table_check();
        break;
      case "3":
        return;
        break;
    }
  }
  sort_options() {
    // Display the options for sorting
    var choice_string = `Sort by:\n0. ID / Index\n1. Name\n2. Description\n3.Activity Date\n4.Scheduled Day\n5.Scheduled Start Time\n6. Scheduled End Time\n7.Duration\n8. Allocated Location\n9. Planned Size\n10. Allocated Staff \n11. Zone\n`;
    var choice = readline.question(choice_string);

    while (isNaN(choice) || choice.length == 0 || choice < 0 || choice > 11) {
      console.clear();
      console.log(
        "Invalid Input. Enter an integer within the following range 0-11"
      );
      var choice = readline.question(choice_string);
    }

    switch (choice) {
      case "0":
        this.table.radix_sort("id");

        break;
      case "1":
        break;
      case "2":
        break;
      case "3":
        this.table.radix_sort("activity_date", true);
      case "4":
        break;
      case "5":
        this.table.radix_sort("scheduled_start_time", false, true);
        break;
      case "6":
        this.table.radix_sort("scheduled_end_time", false, true);
        break;
      case "7":
        this.table.radix_sort("duration", false, true);
        break;
      case "8":
        break;
      case "9":
        this.table.radix_sort("planned_size");
        break;
      case "10":
        break;
      case "11":
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

  max_num(header, isDate = false, isTime = false) {
    var max = -1;
    for (var entry of this.entries) {
      var data = entry[header];
      if (isDate) data = this.convertDate(data);
      if (isTime) data = this.convertTime(data);
      if (data > max) max = data;
    }
    return this.max_digits(max);
  }

  max_digits(num) {
    return String(num).length;
  }

  get_digit(num, idx) {
    // Get value of digit at index
    // Index goes from right to left
    num = String(num);
    var idx = num.length - idx - 1;
    if (idx < 0) return 0;
    else return Number(num[idx]);
  }

  convertDate(date) {
    date = date.split("/");
    date = `${date[1]}/${date[0]}/${date[2]}`;
    date = new Date(date);
    return date.getTime();
  }

  convertTime(time) {
    time = time.split(":");
    var total = 0;
    for (var i = 0; i < time.length; i++) {
      if (i == 2) total += Number(time[i]);
      else total += Number(time[i]) * Math.pow(60, 2 - i);
    }
    return total;
  }

  radix_sort(header, isDate = false, isTime = false) {
    var max_digit = this.max_num(header, isDate, isTime);
    for (var i = 0; i < max_digit; i++) {
      var bucket = [[], [], [], [], [], [], [], [], [], []];
      for (var entry = 0; entry < this.entries.length; entry++) {
        var entry_data = this.entries[entry][header];
        if (isDate) entry_data = this.convertDate(entry_data);
        if (isTime) entry_data = this.convertTime(entry_data);

        var digit = this.get_digit(entry_data, i);
        bucket[digit].push(this.entries[entry]);
      }
      this.entries = bucket.flat();
    }
    return this.entries;
  }
}

var main = new Main();
main.table_check();
