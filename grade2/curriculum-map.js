/* English with Mariami — Grade 2 curriculum map
   Safe planning layer: does not change progress, quiz logic, or existing mission IDs.
   This file is intentionally standalone until the curriculum UI is wired to it.
*/
(function () {
  'use strict';

  window.GRADE2_CURRICULUM_MAP = [
    {
      id: 1,
      key: 'greetings-introduction',
      title: 'Greetings & Introduction',
      goal: 'Say hello, introduce yourself, and ask a simple name question.',
      vocabulary: ['hello', 'hi', 'goodbye', 'name', 'boy', 'girl'],
      language: ['My name is ...', 'I am ...', 'What is your name?'],
      practice: 'short dialogue',
      review: 'basic greetings'
    },
    {
      id: 2,
      key: 'family',
      title: 'Family',
      goal: 'Name close family members and use simple family sentences.',
      vocabulary: ['mother', 'father', 'sister', 'brother', 'baby', 'family'],
      language: ['This is my ...', 'He is my ...', 'She is my ...'],
      practice: 'sentence building',
      review: 'introductions'
    },
    {
      id: 3,
      key: 'school',
      title: 'School',
      goal: 'Recognize common school objects and talk about them simply.',
      vocabulary: ['school', 'teacher', 'student', 'book', 'pencil', 'bag'],
      language: ['This is a ...', 'I have a ...'],
      practice: 'picture naming',
      review: 'family sentences'
    },
    {
      id: 4,
      key: 'home',
      title: 'Home',
      goal: 'Name rooms and familiar things at home.',
      vocabulary: ['home', 'room', 'kitchen', 'bedroom', 'door', 'window'],
      language: ['This is my ...', 'It is in the ...'],
      practice: 'location sentences',
      review: 'school vocabulary'
    },
    {
      id: 5,
      key: 'animals',
      title: 'Animals',
      goal: 'Identify familiar animals and describe them with simple words.',
      vocabulary: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'horse'],
      language: ['It is a ...', 'I like ...', 'It can ...'],
      practice: 'matching and speaking',
      review: 'simple nouns'
    },
    {
      id: 6,
      key: 'food',
      title: 'Food',
      goal: 'Name common foods and express simple likes and dislikes.',
      vocabulary: ['apple', 'banana', 'bread', 'milk', 'water', 'cake'],
      language: ['I like ...', "I don't like ...", 'Do you like ...?'],
      practice: 'mini dialogue',
      review: 'animals'
    },
    {
      id: 7,
      key: 'colors',
      title: 'Colors',
      goal: 'Identify common colors and combine color words with nouns.',
      vocabulary: ['red', 'blue', 'green', 'yellow', 'black', 'white'],
      language: ['It is red.', 'A blue bag.', 'What color is it?'],
      practice: 'visual recognition',
      review: 'food and objects'
    },
    {
      id: 8,
      key: 'feelings',
      title: 'Feelings',
      goal: 'Say how you feel using simple emotion words.',
      vocabulary: ['happy', 'sad', 'angry', 'tired', 'good', 'fine'],
      language: ['I am happy.', 'How are you?', 'I am fine.'],
      practice: 'question and answer',
      review: 'colors'
    },
    {
      id: 9,
      key: 'weather',
      title: 'Weather',
      goal: 'Recognize basic weather words and describe the day.',
      vocabulary: ['sunny', 'rainy', 'cloudy', 'windy', 'hot', 'cold'],
      language: 'It is ... today.',
      practice: 'daily weather sentence',
      review: 'feelings'
    },
    {
      id: 10,
      key: 'body-actions',
      title: 'Body & Actions',
      goal: 'Name basic body parts and understand simple action words.',
      vocabulary: ['head', 'hand', 'eye', 'ear', 'run', 'jump'],
      language: ['This is my ...', 'I can ...'],
      practice: 'listen and do',
      review: 'weather and feelings'
    },
    {
      id: 11,
      key: 'numbers',
      title: 'Numbers & Counting',
      goal: 'Recognize and use numbers in simple counting and classroom tasks.',
      vocabulary: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
      language: ['How many?', 'I have ...', 'There are ...'],
      practice: 'counting game',
      review: 'mixed vocabulary'
    },
    {
      id: 12,
      key: 'simple-grammar-review',
      title: 'Simple Grammar & Review',
      goal: 'Combine Grade 2 vocabulary into short correct sentences and mini dialogues.',
      vocabulary: [],
      language: ['I am ...', 'I have ...', 'I like ...', 'I can ...', 'There is ...', 'There are ...'],
      practice: 'mixed review',
      review: 'Grade 2 cumulative review'
    }
  ];
})();
