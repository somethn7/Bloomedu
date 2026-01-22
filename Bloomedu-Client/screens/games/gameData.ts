// src/games/gameData.ts

export const GAME_CONTENTS: any = {
  Animals: {
    Level1: [
      { id: 1, name: 'Cat', emoji: '🐱', color: '#4ECDC4', speech: 'Find the cute cat' },
      { id: 2, name: 'Dog', emoji: '🐶', color: '#45B7D1', speech: 'Where is the dog?' },
      { id: 3, name: 'Lion', emoji: '🦁', color: '#F7DC6F', speech: 'Touch the lion' },
      { id: 4, name: 'Elephant', emoji: '🐘', color: '#A5A5A5', speech: 'Find the big elephant' },
      { id: 5, name: 'Monkey', emoji: '🐵', color: '#D2B48C', speech: 'Where is the monkey?' },
      { id: 6, name: 'Rabbit', emoji: '🐰', color: '#FFFFFF', speech: 'Find the white rabbit' }
    ],
    Level2: [
      { id: 'f_a1', instruction: "Which one says meow?", audioText: "Which one of these animals says meow?", options: [{ id: 1, emoji: '🐱', label: 'Cat', isCorrect: true }, { id: 2, emoji: '🦁', label: 'Lion', isCorrect: false }] },
      { id: 'f_a2', instruction: "Where does the dog live?", audioText: "Where is the house of the dog?", options: [{ id: 1, emoji: '🏠', label: 'House', isCorrect: true }, { id: 2, emoji: '🚗', label: 'Car', isCorrect: false }] },
      { id: 'f_a3', instruction: "Which one says woof woof?", audioText: "Which one of these animals says woof woof?", options: [{ id: 1, emoji: '🐶', label: 'Dog', isCorrect: true }, { id: 2, emoji: '🐰', label: 'Rabbit', isCorrect: false }] },
      { id: 'f_a4', instruction: "What does the rabbit like to eat?", audioText: "Rabbits are hungry! What do they like to eat?", options: [{ id: 1, emoji: '🥕', label: 'Carrot', isCorrect: true }, { id: 2, emoji: '🥩', label: 'Meat', isCorrect: false }] },
      { id: 'f_a5', instruction: "Which one can fly in the sky?", audioText: "Look at the sky! Which one can fly?", options: [{ id: 1, emoji: '🐦', label: 'Bird', isCorrect: true }, { id: 2, emoji: '🐢', label: 'Turtle', isCorrect: false }] },
      { id: 'f_a6', instruction: "Where does the fish live?", audioText: "Fish need to swim! Where do they live?", options: [{ id: 1, emoji: '🌊', label: 'Sea', isCorrect: true }, { id: 2, emoji: '🌳', label: 'Tree', isCorrect: false }] },
      { id: 'f_a7', instruction: "Which one gives us milk?", audioText: "Which animal gives us healthy milk?", options: [{ id: 1, emoji: '🐮', label: 'Cow', isCorrect: true }, { id: 2, emoji: '🐍', label: 'Snake', isCorrect: false }] },
      { id: 'f_a8', instruction: "Which one is very slow?", audioText: "One of them is very slow. Can you find it?", options: [{ id: 1, emoji: '🐢', label: 'Turtle', isCorrect: true }, { id: 2, emoji: '🐆', label: 'Cheetah', isCorrect: false }] },
      { id: 'f_a9', instruction: "Where does the bird live?", audioText: "The bird wants to rest. Where is its home?", options: [{ id: 1, emoji: '🪹', label: 'Nest', isCorrect: true }, { id: 2, emoji: '🛋️', label: 'Sofa', isCorrect: false }] },
      { id: 'f_a10', instruction: "Which one has a long trunk?", audioText: "This animal is very big and has a long trunk. Which one is it?", options: [{ id: 1, emoji: '🐘', label: 'Elephant', isCorrect: true }, { id: 2, emoji: '🐭', label: 'Mouse', isCorrect: false }] }
    ],
    Level3: [
  {
    id: 'a_l3_1',
    instruction: "Help the kitty find its lunch!",
    audioText: "The little kitty is very hungry and says 'Meow'. She doesn't want to eat grass. What does she want to drink or eat?",
    options: [
      { id: 1, emoji: '🥛', label: 'Milk', isCorrect: true },
      { id: 2, emoji: '🌿', label: 'Grass', isCorrect: false },
      { id: 3, emoji: '🍎', label: 'Apple', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_2',
    instruction: "Where should the bird go to sleep?",
    audioText: "It is getting dark and the little bird is tired of flying. He wants to go to his home in the tree. Where is it?",
    options: [
      { id: 1, emoji: '🪹', label: 'Nest', isCorrect: true },
      { id: 2, emoji: '🏠', label: 'House', isCorrect: false },
      { id: 3, emoji: '🌊', label: 'Sea', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_3',
    instruction: "The monkey wants a sweet snack!",
    audioText: "Look at the silly monkey swinging on the trees! He is looking for his favorite yellow fruit. Can you find it?",
    options: [
      { id: 1, emoji: '🍌', label: 'Banana', isCorrect: true },
      { id: 2, emoji: '🥩', label: 'Meat', isCorrect: false },
      { id: 3, emoji: '🥕', label: 'Carrot', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_4',
    instruction: "Help the puppy find his home!",
    audioText: "The puppy finished playing in the garden. Now he wants to go into his small wooden house. Which one is it?",
    options: [
      { id: 1, emoji: '🏠', label: 'Dog House', isCorrect: true },
      { id: 2, emoji: '🚀', label: 'Rocket', isCorrect: false },
      { id: 3, emoji: '📦', label: 'Box', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_5',
    instruction: "The elephant is very thirsty!",
    audioText: "It's a very hot day in the jungle. The big elephant wants to use his long trunk to drink some water. Where should he go?",
    options: [
      { id: 1, emoji: '🌊', label: 'Water', isCorrect: true },
      { id: 2, emoji: '🌵', label: 'Desert', isCorrect: false },
      { id: 3, emoji: '🏗️', label: 'Building', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_6',
    instruction: "Find a friend for the rabbit!",
    audioText: "The bunny is hopping around the forest. He is looking for a snack that is orange and grows in the ground. What is it?",
    options: [
      { id: 1, emoji: '🥕', label: 'Carrot', isCorrect: true },
      { id: 2, emoji: '🦴', label: 'Bone', isCorrect: false },
      { id: 3, emoji: '🍕', label: 'Pizza', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_7',
    instruction: "Who is the King of the Jungle?",
    audioText: "We hear a very loud 'ROAR'! Someone is very brave and has a big mane. Can you find the King of the Jungle?",
    options: [
      { id: 1, emoji: '🦁', label: 'Lion', isCorrect: true },
      { id: 2, emoji: '🐱', label: 'Cat', isCorrect: false },
      { id: 3, emoji: '🐭', label: 'Mouse', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_8',
    instruction: "The little fish wants to swim!",
    audioText: "The fish is out of the water and he is sad. He needs to go back to the deep blue place to swim with his friends. Where?",
    options: [
      { id: 1, emoji: '🌊', label: 'Ocean', isCorrect: true },
      { id: 2, emoji: '🌳', label: 'Forest', isCorrect: false },
      { id: 3, emoji: '🏜️', label: 'Sand', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_9',
    instruction: "The puppy is looking for his treat!",
    audioText: "The dog was a very good boy today! He is waiting for a yummy bone to chew on. Can you find his treat?",
    options: [
      { id: 1, emoji: '🦴', label: 'Bone', isCorrect: true },
      { id: 2, emoji: '🧀', label: 'Cheese', isCorrect: false },
      { id: 3, emoji: '🍭', label: 'Candy', isCorrect: false }
    ]
  },
  {
    id: 'a_l3_10',
    instruction: "Help the cow find her field!",
    audioText: "The cow wants to eat some fresh green food so she can make healthy milk for us. What does she want to eat?",
    options: [
      { id: 1, emoji: '🌿', label: 'Grass', isCorrect: true },
      { id: 2, emoji: '🍗', label: 'Chicken', isCorrect: false },
      { id: 3, emoji: '🍩', label: 'Donut', isCorrect: false }
    ]
  }
]
  },
  Colors: {
    Level1: [
      { id: 1, name: 'Red', emoji: '🔴', color: '#FF0000', speech: 'Touch the red color' },
      { id: 2, name: 'Blue', emoji: '🔵', color: '#0000FF', speech: 'Where is blue?' },
      { id: 3, name: 'Green', emoji: '🟢', color: '#00FF00', speech: 'Find the green circle' },
      { id: 4, name: 'Yellow', emoji: '🟡', color: '#FFFF00', speech: 'Touch the yellow one' },
      { id: 5, name: 'Purple', emoji: '🟣', color: '#800080', speech: 'Find purple' }
    ],
    Level2: [],
  Level3: [
    {
      id: 'c_l3_1',
      instruction: "You are crossing the street. You see a light that says 'STOP'. Which color means you must stop and wait?",
      audioText: "You are crossing the street. You see a light that says 'STOP'. Which color means you must stop and wait?",
      options: [
        { id: 1, emoji: '🔴', label: 'Red', isCorrect: true },
        { id: 2, emoji: '🟢', label: 'Green', isCorrect: false },
        { id: 3, emoji: '🟡', label: 'Yellow', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_2',
      instruction: "Look at the fire in the fireplace! It is very hot. Which color tells us that something is hot like fire?",
      audioText: "Look at the fire in the fireplace! It is very hot. Which color tells us that something is hot like fire?",
      options: [
        { id: 1, emoji: '🔴', label: 'Red', isCorrect: true },
        { id: 2, emoji: '🔵', label: 'Blue', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_3',
      instruction: "You want to wash your hands with very cold water. Which color on the tap should you choose for cold water?",
      audioText: "You want to wash your hands with very cold water. Which color on the tap should you choose for cold water?",
      options: [
        { id: 1, emoji: '🔵', label: 'Blue', isCorrect: true },
        { id: 2, emoji: '🔴', label: 'Red', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_4',
      instruction: "It is Autumn! The weather is getting cool and the leaves are falling from the trees. What color do the leaves turn into?",
      audioText: "It is Autumn! The weather is getting cool and the leaves are falling from the trees. What color do the leaves turn into?",
      options: [
        { id: 1, emoji: '🟠', label: 'Orange', isCorrect: true },
        { id: 2, emoji: '🟢', label: 'Green', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_5',
      instruction: "Look outside! It is snowing. Everything is covered in cold, beautiful snow. What color is the snow?",
      audioText: "Look outside! It is snowing. Everything is covered in cold, beautiful snow. What color is the snow?",
      options: [
        { id: 1, emoji: '⚪', label: 'White', isCorrect: true },
        { id: 2, emoji: '🟡', label: 'Yellow', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_6',
      instruction: "You see a warning sign that says 'DANGER'. Usually, which color is used for danger or to say 'Be careful'?",
      audioText: "You see a warning sign that says 'DANGER'. Usually, which color is used for danger or to say 'Be careful'?",
      options: [
        { id: 1, emoji: '🔴', label: 'Red', isCorrect: true },
        { id: 2, emoji: '🟢', label: 'Green', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_7',
      instruction: "You are waiting to cross the road. Now the light changed! Which color says 'You can go' or 'Everything is okay'?",
      audioText: "You are waiting to cross the road. Now the light changed! Which color says 'You can go' or 'Everything is okay'?",
      options: [
        { id: 1, emoji: '🟢', label: 'Green', isCorrect: true },
        { id: 2, emoji: '🔴', label: 'Red', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_8',
      instruction: "Imagine you are at the beach looking at the deep sea. What color is the water in the big ocean?",
      audioText: "Imagine you are at the beach looking at the deep sea. What color is the water in the big ocean?",
      options: [
        { id: 1, emoji: '🔵', label: 'Blue', isCorrect: true },
        { id: 2, emoji: '🟡', label: 'Yellow', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_9',
      instruction: "We are walking in a forest full of trees and grass. What is the main color of the leaves in Summer?",
      audioText: "We are walking in a forest full of trees and grass. What is the main color of the leaves in Summer?",
      options: [
        { id: 1, emoji: '🟢', label: 'Green', isCorrect: true },
        { id: 2, emoji: '🟣', label: 'Purple', isCorrect: false }
      ]
    },
    {
      id: 'c_l3_10',
      instruction: "You want to drink a fresh juice made of oranges. Which color is the fruit that has the same name as its color?",
      audioText: "You want to drink a fresh juice made of oranges. Which color is the fruit that has the same name as its color?",
      options: [
        { id: 1, emoji: '🟠', label: 'Orange', isCorrect: true },
        { id: 2, emoji: '🔵', label: 'Blue', isCorrect: false }
      ]
    }
  ]
  },
  Numbers: {
    Level1: [
      { id: 1, name: '1', emoji: '1️⃣', color: '#FF6B9A', speech: 'Find the number one' },
      { id: 2, name: '2', emoji: '2️⃣', color: '#4ECDC4', speech: 'Where is the number two?' },
      { id: 3, name: '3', emoji: '3️⃣', color: '#45B7D1', speech: 'Touch the number three' },
      { id: 4, name: '4', emoji: '4️⃣', color: '#96CEB4', speech: 'Can you find number four?' },
      { id: 5, name: '5', emoji: '5️⃣', color: '#FFEAA7', speech: 'Find the number five' },
      { id: 6, name: '6', emoji: '6️⃣', color: '#DDA0DD', speech: 'Touch the number six' },
      { id: 7, name: '7', emoji: '7️⃣', color: '#98D8C8', speech: 'Where is number seven?' },
      { id: 8, name: '8', emoji: '8️⃣', color: '#F7DC6F', speech: 'Find the number eight' },
      { id: 9, name: '9', emoji: '9️⃣', color: '#BB8FCE', speech: 'Touch the number nine' },
      { id: 10, name: '10', emoji: '🔟', color: '#85C1E9', speech: 'Find the number ten' }
    ],
    Level2: [],
    Level3:  [
  {
    id: 'n_l3_1',
    instruction: "You are at the market! You want to buy apples for 20 Liras. You gave the seller 25 Liras. How much money should the seller give you back?",
    audioText: "You are at the market! You want to buy apples for 20 Liras. You gave the seller 25 Liras. How much money should the seller give you back?",
    options: [
      { id: 1, emoji: '5️⃣', label: '5 Liras', isCorrect: true },
      { id: 2, emoji: '2️⃣', label: '2 Liras', isCorrect: false },
      { id: 3, emoji: '🔟', label: '10 Liras', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_2',
    instruction: "Mom asked for 2 kilos of potatoes and 3 kilos of onions. How many bags of vegetables will you carry in total?",
    audioText: "Mom asked for 2 kilos of potatoes and 3 kilos of onions. How many bags of vegetables will you carry in total?",
    options: [
      { id: 1, emoji: '5️⃣', label: '5 Kilos', isCorrect: true },
      { id: 2, emoji: '2️⃣', label: '2 Kilos', isCorrect: false },
      { id: 3, emoji: '4️⃣', label: '4 Kilos', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_3',
    instruction: "You have 6 strawberries. You want to give half of them to your best friend. How many strawberries will you give?",
    audioText: "You have 6 strawberries. You want to give half of them to your best friend. How many strawberries will you give?",
    options: [
      { id: 1, emoji: '3️⃣', label: '3 pieces', isCorrect: true },
      { id: 2, emoji: '6️⃣', label: '6 pieces', isCorrect: false },
      { id: 3, emoji: '1️⃣', label: '1 piece', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_4',
    instruction: "There are 4 people coming for dinner. You already put 2 plates on the table. How many more plates do you need?",
    audioText: "There are 4 people coming for dinner. You already put 2 plates on the table. How many more plates do you need?",
    options: [
      { id: 1, emoji: '2️⃣', label: '2 more', isCorrect: true },
      { id: 2, emoji: '4️⃣', label: '4 more', isCorrect: false },
      { id: 3, emoji: '0️⃣', label: 'No more', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_5',
    instruction: "Your toy train has 3 blue cars and 4 red cars. How many cars are on your train in total?",
    audioText: "Your toy train has 3 blue cars and 4 red cars. How many cars are on your train in total?",
    options: [
      { id: 1, emoji: '7️⃣', label: '7 cars', isCorrect: true },
      { id: 2, emoji: '3️⃣', label: '3 cars', isCorrect: false },
      { id: 3, emoji: '🔟', label: '10 cars', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_6',
    instruction: "You collected 10 eggs from the farm, but 2 of them broke! Oh no! How many eggs are left in your basket?",
    audioText: "You collected 10 eggs from the farm, but 2 of them broke! Oh no! How many eggs are left in your basket?",
    options: [
      { id: 1, emoji: '8️⃣', label: '8 eggs', isCorrect: true },
      { id: 2, emoji: '🔟', label: '10 eggs', isCorrect: false },
      { id: 3, emoji: '5️⃣', label: '5 eggs', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_7',
    instruction: "One banana costs 3 Liras. You want to buy 2 bananas. How much money do you need to pay?",
    audioText: "One banana costs 3 Liras. You want to buy 2 bananas. How much money do you need to pay?",
    options: [
      { id: 1, emoji: '6️⃣', label: '6 Liras', isCorrect: true },
      { id: 2, emoji: '3️⃣', label: '3 Liras', isCorrect: false },
      { id: 3, emoji: '9️⃣', label: '9 Liras', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_8',
    instruction: "A bird has 2 feet. If there are two birds on the branch, how many feet do you see in total?",
    audioText: "A bird has 2 feet. If there are two birds on the branch, how many feet do you see in total?",
    options: [
      { id: 1, emoji: '4️⃣', label: '4 feet', isCorrect: true },
      { id: 2, emoji: '2️⃣', label: '2 feet', isCorrect: false },
      { id: 3, emoji: '8️⃣', label: '8 feet', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_9',
    instruction: "You have 5 balloons. A bird poked 1 balloon and it went POP! How many balloons are still flying?",
    audioText: "You have 5 balloons. A bird poked 1 balloon and it went POP! How many balloons are still flying?",
    options: [
      { id: 1, emoji: '4️⃣', label: '4 balloons', isCorrect: true },
      { id: 2, emoji: '5️⃣', label: '5 balloons', isCorrect: false },
      { id: 3, emoji: '1️⃣', label: '1 balloon', isCorrect: false }
    ]
  },
  {
    id: 'n_l3_10',
    instruction: "You have 10 Liras. You bought a lollipop for 7 Liras. How much change will you get back?",
    audioText: "You have 10 Liras. You bought a lollipop for 7 Liras. How much change will you get back?",
    options: [
      { id: 1, emoji: '3️⃣', label: '3 Liras', isCorrect: true },
      { id: 2, emoji: '7️⃣', label: '7 Liras', isCorrect: false },
      { id: 3, emoji: '1️⃣', label: '1 Lira', isCorrect: false }
    ]
  }
]
  },
  Vehicles: {
    Level1: [
      { id: 1, name: 'Car', emoji: '🚗', color: '#FF4757', speech: 'Find the red car' },
      { id: 2, name: 'Plane', emoji: '✈️', color: '#747D8C', speech: 'Where is the airplane?' },
      { id: 3, name: 'Bus', emoji: '🚌', color: '#ECCC68', speech: 'Touch the yellow bus' },
      { id: 4, name: 'Ship', emoji: '🚢', color: '#2F3542', speech: 'Find the big ship' },
      { id: 5, name: 'Bicycle', emoji: '🚲', color: '#1E90FF', speech: 'Where is the bicycle?' },
      { id: 6, name: 'Police Car', emoji: '🚑', color: '#2E86DE', speech: 'Find the police car' },
      { id: 7, name: 'Fire Truck', emoji: '🚒', color: '#EE5253', speech: 'Where is the red fire truck?' },
      { id: 8, name: 'Helicopter', emoji: '🚁', color: '#10AC84', speech: 'Touch the helicopter' },
      { id: 9, name: 'Train', emoji: '🚂', color: '#576574', speech: 'Can you find the train?' },
      { id: 10, name: 'Rocket', emoji: '🚀', color: '#FF9F43', speech: 'Find the rocket' },
      { id: 11, name: 'Tractor', emoji: '🚜', color: '#1DD1A1', speech: 'Where is the green tractor?' },
      { id: 12, name: 'Motorcycle', emoji: '🏍️', color: '#54A0FF', speech: 'Touch the motorcycle' }
    ],
    Level2: [
      { id: 'v_l2_1', instruction: "Which one flies in the sky?", audioText: "Look up at the clouds! Which one flies high in the sky?", options: [{ id: 1, emoji: '✈️', label: 'Plane', isCorrect: true }, { id: 2, emoji: '🚗', label: 'Car', isCorrect: false }, { id: 3, emoji: '🚢', label: 'Ship', isCorrect: false }] },
      { id: 'v_l2_2', instruction: "Which one sails on the water?", audioText: "We are going on a blue ocean trip! Which one sails on the water?", options: [{ id: 1, emoji: '🚢', label: 'Ship', isCorrect: true }, { id: 2, emoji: '🚌', label: 'Bus', isCorrect: false }, { id: 3, emoji: '🚲', label: 'Bicycle', isCorrect: false }] },
      { id: 'v_l2_3', instruction: "Which one goes to the space?", audioText: "Three, two, one, blast off! Which one travels to the stars and the moon?", options: [{ id: 1, emoji: '🚀', label: 'Rocket', isCorrect: true }, { id: 2, emoji: '🚁', label: 'Helicopter', isCorrect: false }, { id: 3, emoji: '🚂', label: 'Train', isCorrect: false }] },
      { id: 'v_l2_4', instruction: "Which one helps us put out fires?", audioText: "Oh no, there is a fire! Which special truck helps the firefighters?", options: [{ id: 1, emoji: '🚒', label: 'Fire Truck', isCorrect: true }, { id: 2, emoji: '🚜', label: 'Tractor', isCorrect: false }, { id: 3, emoji: '🚑', label: 'Ambulance', isCorrect: false }] },
      { id: 'v_l2_5', instruction: "Which one has only two wheels?", audioText: "Ring ring! This one is light and has only two wheels. Can you find it?", options: [{ id: 1, emoji: '🚲', label: 'Bicycle', isCorrect: true }, { id: 2, emoji: '🚗', label: 'Car', isCorrect: false }, { id: 3, emoji: '🚌', label: 'Bus', isCorrect: false }] },
      { id: 'v_l2_6', instruction: "Which one helps the farmer?", audioText: "Working on the farm is fun! Which green machine helps the farmer in the field?", options: [{ id: 1, emoji: '🚜', label: 'Tractor', isCorrect: true }, { id: 2, emoji: '🚁', label: 'Helicopter', isCorrect: false }, { id: 3, emoji: '🚢', label: 'Ship', isCorrect: false }] },
      { id: 'v_l2_7', instruction: "Which one goes on the tracks?", audioText: "Choo-choo! This long vehicle goes on the metal tracks. Which one is it?", options: [{ id: 1, emoji: '🚂', label: 'Train', isCorrect: true }, { id: 2, emoji: '🚌', label: 'Bus', isCorrect: false }, { id: 3, emoji: '✈️', label: 'Plane', isCorrect: false }] },
      { id: 'v_l2_8', instruction: "Which one takes many students to school?", audioText: "It's time for school! Which big yellow vehicle takes all the children together?", options: [{ id: 1, emoji: '🚌', label: 'Bus', isCorrect: true }, { id: 2, emoji: '🏍️', label: 'Motorcycle', isCorrect: false }, { id: 3, emoji: '🚀', label: 'Rocket', isCorrect: false }] },
      { id: 'v_l2_9', instruction: "Which one can land anywhere without a runway?", audioText: "Flap-flap-flap! This one has big propellers on top and can land on a building. Which one?", options: [{ id: 1, emoji: '🚁', label: 'Helicopter', isCorrect: true }, { id: 2, emoji: '✈️', label: 'Plane', isCorrect: false }, { id: 3, emoji: '🚂', label: 'Train', isCorrect: false }] },
      { id: 'v_l2_10', instruction: "Which one has a loud siren and helps people?", audioText: "Nee-naw, nee-naw! This car moves very fast to help people who are hurt. Find it!", options: [{ id: 1, emoji: '🚑', label: 'Ambulance', isCorrect: true }, { id: 2, emoji: '🚜', label: 'Tractor', isCorrect: false }, { id: 3, emoji: '🚲', label: 'Bicycle', isCorrect: false }] }
    ]
  },
  Jobs: {
    Level1: [
      { id: 1, name: 'Doctor', emoji: '🧑‍⚕️', color: '#45B7D1', speech: 'Find the doctor' },
      { id: 2, name: 'Teacher', emoji: '🧑‍🏫', color: '#96CEB4', speech: 'Where is the teacher?' },
      { id: 3, name: 'Firefighter', emoji: '🧑‍🚒', color: '#FF6B6B', speech: 'Touch the firefighter' },
      { id: 4, name: 'Police Officer', emoji: '👮', color: '#2E86DE', speech: 'Can you find the police officer?' },
      { id: 5, name: 'Cook', emoji: '🧑‍🍳', color: '#FFEAA7', speech: 'Find the cook' },
      { id: 6, name: 'Farmer', emoji: '🧑‍🌾', color: '#1DD1A1', speech: 'Where is the farmer?' },
      { id: 7, name: 'Pilot', emoji: '🧑‍✈️', color: '#747D8C', speech: 'Touch the pilot' },
      { id: 8, name: 'Artist', emoji: '🧑‍🎨', color: '#BE4BDB', speech: 'Find the artist' },
      { id: 9, name: 'Astronaut', emoji: '🧑‍🚀', color: '#D1D8E0', speech: 'Where is the astronaut?' },
      { id: 10, name: 'Scientist', emoji: '🧑‍🔬', color: '#20BF6B', speech: 'Touch the scientist' },
      { id: 11, name: 'Dentist', emoji: '🦷', color: '#45AAF2', speech: 'Find the dentist' },
      { id: 12, name: 'Builder', emoji: '👷', color: '#F7B731', speech: 'Where is the builder?' },
      { id: 13, name: 'Singer', emoji: '🧑‍🎤', color: '#A55EEA', speech: 'Touch the singer' },
      { id: 14, name: 'Mailman', emoji: '📬', color: '#EB3B5A', speech: 'Find the mailman' },
      { id: 15, name: 'Gardener', emoji: '🧑‍🌾', color: '#26DE81', speech: 'Where is the gardener?' }
    ],
    Level2: [
      { id: 'j_l2_1', instruction: "Who helps us when we are sick?", audioText: "Oh no, you have a cough! Who wears a white coat and helps you feel better?", options: [{ id: 1, emoji: '🧑‍⚕️', label: 'Doctor', isCorrect: true }, { id: 2, emoji: '🧑‍🌾', label: 'Farmer', isCorrect: false }, { id: 3, emoji: '🧑‍🍳', label: 'Cook', isCorrect: false }] },
      { id: 'j_l2_2', instruction: "Who cooks delicious food in a restaurant?", audioText: "I'm so hungry! Who wears a big white hat and cooks yummy pasta?", options: [{ id: 1, emoji: '🧑‍🍳', label: 'Cook', isCorrect: true }, { id: 2, emoji: '👮', label: 'Police', isCorrect: false }, { id: 3, emoji: '🧑‍🚀', label: 'Astronaut', isCorrect: false }] },
      { id: 'j_l2_3', instruction: "Who teaches us new things at school?", audioText: "Time to learn our ABCs! Who stands at the blackboard and teaches us at school?", options: [{ id: 1, emoji: '🧑‍🏫', label: 'Teacher', isCorrect: true }, { id: 2, emoji: '🧑‍✈️', label: 'Pilot', isCorrect: false }, { id: 3, emoji: '🧑‍🚒', label: 'Firefighter', isCorrect: false }] },
      { id: 'j_l2_4', instruction: "Who puts out fires with a long hose?", audioText: "Nee-naw! There is a big fire! Who wears a helmet and puts out the flames?", options: [{ id: 1, emoji: '🧑‍🚒', label: 'Firefighter', isCorrect: true }, { id: 2, emoji: '🧑‍🌾', label: 'Farmer', isCorrect: false }, { id: 3, emoji: '🧑‍🏫', label: 'Teacher', isCorrect: false }] },
      { id: 'j_l2_5', instruction: "Who flies the big airplane in the sky?", audioText: "Fasten your seatbelts! Who sits in the cockpit and flies us to different countries?", options: [{ id: 1, emoji: '🧑‍✈️', label: 'Pilot', isCorrect: true }, { id: 2, emoji: '🧑‍⚕️', label: 'Doctor', isCorrect: false }, { id: 3, emoji: '👮', label: 'Police', isCorrect: false }] },
      { id: 'j_l2_6', instruction: "Who grows vegetables and takes care of animals?", audioText: "Old MacDonald had a farm! Who plants the seeds and drives the tractor?", options: [{ id: 1, emoji: '🧑‍🌾', label: 'Farmer', isCorrect: true }, { id: 2, emoji: '🧑‍🚀', label: 'Astronaut', isCorrect: false }, { id: 3, emoji: '🧑‍🍳', label: 'Cook', isCorrect: false }] },
      { id: 'j_l2_7', instruction: "Who protects us and keeps the city safe?", audioText: "Who wears a blue uniform and drives a car with flashing lights to keep us safe?", options: [{ id: 1, emoji: '👮', label: 'Police', isCorrect: true }, { id: 2, emoji: '🧑‍🏫', label: 'Teacher', isCorrect: false }, { id: 3, emoji: '🧑‍⚕️', label: 'Doctor', isCorrect: false }] },
      { id: 'j_l2_8', instruction: "Who travels to the moon in a rocket?", audioText: "Ready for blast off! Who wears a space suit and walks on the moon?", options: [{ id: 1, emoji: '🧑‍🚀', label: 'Astronaut', isCorrect: true }, { id: 2, emoji: '🧑‍✈️', label: 'Pilot', isCorrect: false }, { id: 3, emoji: '🧑‍🚒', label: 'Firefighter', isCorrect: false }] },
      { id: 'j_l2_9', instruction: "Who uses a stethoscope to hear your heart?", audioText: "Thump-thump, thump-thump! Who listens to your heart with a special tool?", options: [{ id: 1, emoji: '🧑‍⚕️', label: 'Doctor', isCorrect: true }, { id: 2, emoji: '🧑‍🍳', label: 'Cook', isCorrect: false }, { id: 3, emoji: '🧑‍🌾', label: 'Farmer', isCorrect: false }] },
      { id: 'j_l2_10', instruction: "Who makes fresh bread and cakes?", audioText: "The bakery smells amazing! Who is busy baking fresh bread and cupcakes?", options: [{ id: 1, emoji: '🧑‍🍳', label: 'Cook', isCorrect: true }, { id: 2, emoji: '👮', label: 'Police', isCorrect: false }, { id: 3, emoji: '🧑‍🏫', label: 'Teacher', isCorrect: false }] }
    ]
  },
  Fruits: {
    Level1: [
      { id: 1, name: 'Apple', emoji: '🍎', color: '#FF6B6B', speech: 'Find the red apple' },
      { id: 2, name: 'Banana', emoji: '🍌', color: '#FFEAA7', speech: 'Where is the yellow banana?' },
      { id: 3, name: 'Grape', emoji: '🍇', color: '#BE4BDB', speech: 'Touch the purple grapes' },
      { id: 4, name: 'Orange', emoji: '🍊', color: '#FD9644', speech: 'Can you find the orange?' },
      { id: 5, name: 'Strawberry', emoji: '🍓', color: '#FF4757', speech: 'Find the sweet strawberry' },
      { id: 6, name: 'Watermelon', emoji: '🍉', color: '#26DE81', speech: 'Where is the watermelon?' },
      { id: 7, name: 'Pineapple', emoji: '🍍', color: '#F7DC6F', speech: 'Touch the pineapple' },
      { id: 8, name: 'Cherry', emoji: '🍒', color: '#EE5253', speech: 'Find the red cherries' },
      { id: 9, name: 'Pear', emoji: '🍐', color: '#A8E063', speech: 'Where is the green pear?' },
      { id: 10, name: 'Kiwi', emoji: '🥝', color: '#556B2F', speech: 'Touch the kiwi' },
      { id: 11, name: 'Lemon', emoji: '🍋', color: '#FFF200', speech: 'Find the yellow lemon' },
      { id: 12, name: 'Peach', emoji: '🍑', color: '#FFBE76', speech: 'Where is the peach?' },
      { id: 13, name: 'Mango', emoji: '🥭', color: '#FF9F43', speech: 'Touch the mango' },
      { id: 14, name: 'Avocado', emoji: '🥑', color: '#2ECC71', speech: 'Find the avocado' },
      { id: 15, name: 'Blueberry', emoji: '🫐', color: '#4834D4', speech: 'Where are the blueberries?' },
      { id: 16, name: 'Coconut', emoji: '🥥', color: '#F3F4F6', speech: 'Touch the coconut' },
      { id: 17, name: 'Melon', emoji: '🍈', color: '#ECCC68', speech: 'Where is the melon?' },
      { id: 18, name: 'Apricot', emoji: '🍑', color: '#F39C12', speech: 'Touch the apricot' }
    ],
    Level2: [
      { id: 'f_f1', instruction: "What does the monkey like to eat?", audioText: "Monkeys are very hungry! What do they like to eat?", options: [{ id: 1, emoji: '🍌', label: 'Banana', isCorrect: true }, { id: 2, emoji: '🥩', label: 'Meat', isCorrect: false }] },
      { id: 'f_f2', instruction: "Which one is red?", audioText: "Can you find the red fruit?", options: [{ id: 1, emoji: '🍎', label: 'Apple', isCorrect: true }, { id: 2, emoji: '🍌', label: 'Banana', isCorrect: false }] },
      { id: 'f_f3', instruction: "Which one is a summer fruit?", audioText: "It's very hot! Which fruit is big, green and watery?", options: [{ id: 1, emoji: '🍉', label: 'Watermelon', isCorrect: true }, { id: 2, emoji: '🥔', label: 'Potato', isCorrect: false }] },
      { id: 'f_f4', instruction: "Where do apples grow?", audioText: "Where can we find apples? On a tree or in the sea?", options: [{ id: 1, emoji: '🌳', label: 'Tree', isCorrect: true }, { id: 2, emoji: '🌊', label: 'Sea', isCorrect: false }] },
      { id: 'f_f5', instruction: "Which one is sour?", audioText: "This fruit is very sour! Which one is it?", options: [{ id: 1, emoji: '🍋', label: 'Lemon', isCorrect: true }, { id: 2, emoji: '🍫', label: 'Chocolate', isCorrect: false }] },
      { id: 'f_f6', instruction: "Which one is yellow?", audioText: "Find the yellow fruit!", options: [{ id: 1, emoji: '🍋', label: 'Lemon', isCorrect: true }, { id: 2, emoji: '🍇', label: 'Grape', isCorrect: false }] },
      { id: 'f_f7', instruction: "What do we need to make orange juice?", audioText: "We want to drink juice! Which fruit do we use?", options: [{ id: 1, emoji: '🍊', label: 'Orange', isCorrect: true }, { id: 2, emoji: '🥦', label: 'Broccoli', isCorrect: false }] },
      { id: 'f_f8', instruction: "Which fruit has tiny seeds on it?", audioText: "This red fruit has tiny seeds. Which one is it?", options: [{ id: 1, emoji: '🍓', label: 'Strawberry', isCorrect: true }, { id: 2, emoji: '🥥', label: 'Coconut', isCorrect: false }] },
      { id: 'f_f9', instruction: "Which one is purple?", audioText: "Find the purple grapes!", options: [{ id: 1, emoji: '🍇', label: 'Grape', isCorrect: true }, { id: 2, emoji: '🍐', label: 'Pear', isCorrect: false }] },
      { id: 'f_f10', instruction: "Which one is a tropical fruit?", audioText: "This fruit has a crown! Can you find the pineapple?", options: [{ id: 1, emoji: '🍍', label: 'Pineapple', isCorrect: true }, { id: 2, emoji: '🍅', label: 'Tomato', isCorrect: false }] }
    ]
  },
  Vegetables: {
    Level1: [
      { id: 1, name: 'Tomato', emoji: '🍅', color: '#FF4757', speech: 'Find the red tomato' },
      { id: 2, name: 'Broccoli', emoji: '🥦', color: '#26DE81', speech: 'Where is the green broccoli?' },
      { id: 3, name: 'Carrot', emoji: '🥕', color: '#FD9644', speech: 'Touch the orange carrot' },
      { id: 4, name: 'Corn', emoji: '🌽', color: '#ECCC68', speech: 'Can you find the yellow corn?' },
      { id: 5, name: 'Eggplant', emoji: '🍆', color: '#5758BB', speech: 'Find the purple eggplant' },
      { id: 6, name: 'Cucumber', emoji: '🥒', color: '#7BED9F', speech: 'Where is the cucumber?' },
      { id: 7, name: 'Potato', emoji: '🥔', color: '#D2B48C', speech: 'Touch the potato' },
      { id: 8, name: 'Onion', emoji: '🧅', color: '#F8C291', speech: 'Find the onion' },
      { id: 9, name: 'Mushroom', emoji: '🍄', color: '#FF7F50', speech: 'Where is the mushroom?' },
      { id: 10, name: 'Peas', emoji: '🫛', color: '#20BF6B', speech: 'Touch the green peas' },
      { id: 11, name: 'Pepper', emoji: '🫑', color: '#EB3B5A', speech: 'Find the bell pepper' },
      { id: 12, name: 'Pumpkin', emoji: '🎃', color: '#F19066', speech: 'Where is the orange pumpkin?' },
      { id: 13, name: 'Garlic', emoji: '🧄', color: '#F1F2F6', speech: 'Touch the garlic' },
      { id: 14, name: 'Lettuce', emoji: '🥬', color: '#78E08F', speech: 'Find the green lettuce' },
      { id: 15, name: 'Cabbage', emoji: '🥬', color: '#B8E994', speech: 'Where is the cabbage?' },
      { id: 16, name: 'Spinach', emoji: '🍃', color: '#38ADA9', speech: 'Touch the spinach' },
      { id: 17, name: 'Radish', emoji: '🥗', color: '#E55039', speech: 'Find the radish' },
      { id: 18, name: 'Asparagus', emoji: '🎍', color: '#60A3BC', speech: 'Where is the asparagus?' },
      { id: 19, name: 'Artichoke', emoji: '🥦', color: '#3C6382', speech: 'Touch the artichoke' },
      { id: 20, name: 'Sweet Potato', emoji: '🍠', color: '#82CCDD', speech: 'Find the sweet potato' }
    ],
    Level2: [
      { id: 'v_l2_1', instruction: "Which one grows under the ground?", audioText: "Some vegetables hide under the dirt! Which one grows under the ground?", options: [{ id: 1, emoji: '🥔', label: 'Potato', isCorrect: true }, { id: 2, emoji: '🍅', label: 'Tomato', isCorrect: false }, { id: 3, emoji: '🥦', label: 'Broccoli', isCorrect: false }] },
      { id: 'v_l2_2', instruction: "Which one looks like a tiny tree?", audioText: "Look at this vegetable! It looks like a small green tree. Which one is it?", options: [{ id: 1, emoji: '🥦', label: 'Broccoli', isCorrect: true }, { id: 2, emoji: '🌽', label: 'Corn', isCorrect: false }, { id: 3, emoji: '🍆', label: 'Eggplant', isCorrect: false }] },
      { id: 'v_l2_3', instruction: "Which one is used to make soup orange?", audioText: "We want to make a yummy orange soup! Which vegetable should we use?", options: [{ id: 1, emoji: '🥕', label: 'Carrot', isCorrect: true }, { id: 2, emoji: '🥒', label: 'Cucumber', isCorrect: false }, { id: 3, emoji: '🥬', label: 'Lettuce', isCorrect: false }] },
      { id: 'v_l2_4', instruction: "Which one has tiny green balls inside?", audioText: "Pop! This vegetable has little green balls hidden inside. Can you find it?", options: [{ id: 1, emoji: '🫛', label: 'Peas', isCorrect: true }, { id: 2, emoji: '🍄', label: 'Mushroom', isCorrect: false }, { id: 3, emoji: '🧅', label: 'Onion', isCorrect: false }] },
      { id: 'v_l2_5', instruction: "Which one is very big and orange?", audioText: "This vegetable can grow very, very big! It is orange and round. Which one is it?", options: [{ id: 1, emoji: '🎃', label: 'Pumpkin', isCorrect: true }, { id: 2, emoji: '🧄', label: 'Garlic', isCorrect: false }, { id: 3, emoji: '🥗', label: 'Radish', isCorrect: false }] },
      { id: 'v_l2_6', instruction: "Which one is white and has a strong smell?", audioText: "This one is white and very healthy, but it has a very strong smell. What is it?", options: [{ id: 1, emoji: '🧄', label: 'Garlic', isCorrect: true }, { id: 2, emoji: '🌽', label: 'Corn', isCorrect: false }, { id: 3, emoji: '🍅', label: 'Tomato', isCorrect: false }] },
      { id: 'v_l2_7', instruction: "Which one is yellow and has many seeds?", audioText: "This vegetable is tall and yellow. It has many small seeds on it. Which one?", options: [{ id: 1, emoji: '🌽', label: 'Corn', isCorrect: true }, { id: 2, emoji: '🍆', label: 'Eggplant', isCorrect: false }, { id: 3, emoji: '🥬', label: 'Lettuce', isCorrect: false }] },
      { id: 'v_l2_8', instruction: "Which one is used to make red ketchup?", audioText: "Yummy ketchup! Which red vegetable do we use to make ketchup?", options: [{ id: 1, emoji: '🍅', label: 'Tomato', isCorrect: true }, { id: 2, emoji: '🥔', label: 'Potato', isCorrect: false }, { id: 3, emoji: '🥒', label: 'Cucumber', isCorrect: false }] },
      { id: 'v_l2_9', instruction: "Which one makes people cry when they cut it?", audioText: "Oh no! This vegetable can make us cry when we chop it. Which one is it?", options: [{ id: 1, emoji: '🧅', label: 'Onion', isCorrect: true }, { id: 2, emoji: '🫑', label: 'Pepper', isCorrect: false }, { id: 3, emoji: '🍄', label: 'Mushroom', isCorrect: false }] },
      { id: 'v_l2_10', instruction: "Which one is purple and long?", audioText: "Look at this beautiful purple color! Which vegetable is long and purple?", options: [{ id: 1, emoji: '🍆', label: 'Eggplant', isCorrect: true }, { id: 2, emoji: '🌽', label: 'Corn', isCorrect: false }, { id: 3, emoji: '🥕', label: 'Carrot', isCorrect: false }] }
    ]
  },
Objects: {
  Level1: [
    { id: 1, name: 'Umbrella', emoji: '☔', color: '#48DBFB', speech: 'Find the umbrella' },
    { id: 2, name: 'Toothbrush', emoji: '🪥', color: '#FF9FF3', speech: 'Where is the toothbrush?' },
    { id: 3, name: 'Bed', emoji: '🛏️', color: '#A5A5A5', speech: 'Touch the bed' },
    { id: 4, name: 'Soap', emoji: '🧼', color: '#7BED9F', speech: 'Find the soap' },
    { id: 5, name: 'Light Bulb', emoji: '💡', color: '#F7DC6F', speech: 'Touch the light bulb' },
    { id: 6, name: 'Broom', emoji: '🧹', color: '#D2B48C', speech: 'Where is the broom?' },
    { id: 7, name: 'Shoe', emoji: '👟', color: '#54A0FF', speech: 'Find the shoe' },
    { id: 8, name: 'Fork and Knife', emoji: '🍴', color: '#DFE4EA', speech: 'Touch the fork and knife' },
    { id: 9, name: 'Bathtub', emoji: '🛀', color: '#4834D4', speech: 'Find the bathtub' },
    { id: 10, name: 'Sofa', emoji: '🛋️', color: '#FF9F43', speech: 'Where is the sofa?' }
  ],
  Level2: [
    { 
      id: 'obj_l2_1', 
      instruction: "It's raining! Which one do we use?", 
      audioText: "Oh look, it is raining outside! Which one do we use to stay dry?", 
      options: [
        { id: 1, emoji: '☔', label: 'Umbrella', isCorrect: true }, 
        { id: 2, emoji: '☀️', label: 'Sun', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_2', 
      instruction: "Which one do we use to brush our teeth?", 
      audioText: "Time to clean our teeth! Which one do we use to make them sparkle?", 
      options: [
        { id: 1, emoji: '🪥', label: 'Toothbrush', isCorrect: true }, 
        { id: 2, emoji: '🥄', label: 'Spoon', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_3', 
      instruction: "We are sleepy. Where do we sleep?", 
      audioText: "Yawn... I am so tired. Where should I go to sleep?", 
      options: [
        { id: 1, emoji: '🛏️', label: 'Bed', isCorrect: true }, 
        { id: 2, emoji: '🚽', label: 'Toilet', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_4', 
      instruction: "Our hands are dirty. What do we use?", 
      audioText: "Look at your hands, they are a bit dirty! What do we use to wash them?", 
      options: [
        { id: 1, emoji: '🧼', label: 'Soap', isCorrect: true }, 
        { id: 2, emoji: '🖍️', label: 'Crayon', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_5', 
      instruction: "It's dark. Which one gives us light?", 
      audioText: "It is very dark in this room! What should we turn on for some light?", 
      options: [
        { id: 1, emoji: '💡', label: 'Light', isCorrect: true }, 
        { id: 2, emoji: '📦', label: 'Box', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_6', 
      instruction: "The floor is dirty. What do we use to clean?", 
      audioText: "Let's help clean the floor! Which one do we use to sweep?", 
      options: [
        { id: 1, emoji: '🧹', label: 'Broom', isCorrect: true }, 
        { id: 2, emoji: '🧸', label: 'Teddy', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_7', 
      instruction: "Which one do we use for eating?", 
      audioText: "The food is ready! Which one do we use to eat our dinner?", 
      options: [
        { id: 1, emoji: '🍴', label: 'Fork & Knife', isCorrect: true }, 
        { id: 2, emoji: '🛋️', label: 'Sofa', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_8', 
      instruction: "Which one do we wear on our feet?", 
      audioText: "Let's go for a walk! What should we put on our feet?", 
      options: [
        { id: 1, emoji: '👟', label: 'Shoe', isCorrect: true }, 
        { id: 2, emoji: '🕶️', label: 'Glasses', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_9', 
      instruction: "Where do we take a bath?", 
      audioText: "Time for a bubble bath! Where do we go to get clean and play with water?", 
      options: [
        { id: 1, emoji: '🛀', label: 'Bathtub', isCorrect: true }, 
        { id: 2, emoji: '🪑', label: 'Chair', isCorrect: false }
      ] 
    },
    { 
      id: 'obj_l2_10', 
      instruction: "Where do we sit in the living room?", 
      audioText: "Let's watch a movie together! Where do we sit in the living room?", 
      options: [
        { id: 1, emoji: '🛋️', label: 'Sofa', isCorrect: true }, 
        { id: 2, emoji: '🚲', label: 'Bicycle', isCorrect: false }
      ] 
    },
  ],
    Level3: [
  {
    id: 'obj_l3_1',
    instruction: "Help me get ready for a walk!",
    audioText: "It is time to go to the park! But look at my feet, I am only wearing socks. What do I need to put on so I can walk outside?",
    options: [
      { id: 1, emoji: '👟', label: 'Shoes', isCorrect: true },
      { id: 2, emoji: '🛀', label: 'Bathtub', isCorrect: false },
      { id: 3, emoji: '🛋️', label: 'Sofa', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_2',
    instruction: "It's getting very dark in here!",
    audioText: "Oh no! The sun went down and now I cannot see my toys. It is very dark. What can we turn on so the room becomes bright?",
    options: [
      { id: 1, emoji: '💡', label: 'Light', isCorrect: true },
      { id: 2, emoji: '🧹', label: 'Broom', isCorrect: false },
      { id: 3, emoji: '🍴', label: 'Fork', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_3',
    instruction: "I spilled my crackers on the floor!",
    audioText: "Oops! I accidentally dropped my crackers and now the floor is messy. Which tool can we use to sweep the crumbs away?",
    options: [
      { id: 1, emoji: '🧹', label: 'Broom', isCorrect: true },
      { id: 2, emoji: '🪥', label: 'Toothbrush', isCorrect: false },
      { id: 3, emoji: '☔', label: 'Umbrella', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_4',
    instruction: "The pasta is ready to eat!",
    audioText: "Mmm, dinner smells great! I am sitting at the table, but I need something to pick up my pasta. What should I use?",
    options: [
      { id: 1, emoji: '🍴', label: 'Fork', isCorrect: true },
      { id: 2, emoji: '🧼', label: 'Soap', isCorrect: false },
      { id: 3, emoji: '👟', label: 'Shoe', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_5',
    instruction: "Let's have a bubble bath party!",
    audioText: "I want to play with my rubber ducky and get all clean with lots of bubbles. Where is the best place to take a bath?",
    options: [
      { id: 1, emoji: '🛀', label: 'Bathtub', isCorrect: true },
      { id: 2, emoji: '🛏️', label: 'Bed', isCorrect: false },
      { id: 3, emoji: '🛋️', label: 'Sofa', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_6',
    instruction: "I want my teeth to sparkle!",
    audioText: "I just finished my yummy breakfast. Now I need to make my teeth white and smell fresh. What tool do I need?",
    options: [
      { id: 1, emoji: '🪥', label: 'Toothbrush', isCorrect: true },
      { id: 2, emoji: '🍴', label: 'Fork', isCorrect: false },
      { id: 3, emoji: '💡', label: 'Light', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_7',
    instruction: "I hear rain on the window!",
    audioText: "Look! Water is falling from the sky. If I go outside to play, I will get wet! What can I hold to stay dry?",
    options: [
      { id: 1, emoji: '☔', label: 'Umbrella', isCorrect: true },
      { id: 2, emoji: '🧼', label: 'Soap', isCorrect: false },
      { id: 3, emoji: '🛏️', label: 'Bed', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_8',
    instruction: "I am yawning... I'm so tired!",
    audioText: "The stars are out and I am so sleepy. I want to close my eyes and have a long sleep. Where should I go?",
    options: [
      { id: 1, emoji: '🛏️', label: 'Bed', isCorrect: true },
      { id: 2, emoji: '👟', label: 'Shoe', isCorrect: false },
      { id: 3, emoji: '🛀', label: 'Bathtub', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_9',
    instruction: "My hands are very messy!",
    audioText: "I was playing in the garden and now my hands have dirt on them. What should I use with water to wash the germs away?",
    options: [
      { id: 1, emoji: '🧼', label: 'Soap', isCorrect: true },
      { id: 2, emoji: '🛋️', label: 'Sofa', isCorrect: false },
      { id: 3, emoji: '💡', label: 'Light', isCorrect: false }
    ]
  },
  {
    id: 'obj_l3_10',
    instruction: "Grandma is here for a visit!",
    audioText: "Grandma is at our house! We want to sit down together and tell stories. Which soft, big chair in the living room should we use?",
    options: [
      { id: 1, emoji: '🛋️', label: 'Sofa', isCorrect: true },
      { id: 2, emoji: '☔', label: 'Umbrella', isCorrect: false },
      { id: 3, emoji: '🧹', label: 'Broom', isCorrect: false }
    ]
  }
]

},
  Emotions: {
    Level1: [
      { id: 1, name: 'Happy', emoji: '😊', color: '#FFD32A', speech: 'Find the happy face' },
      { id: 2, name: 'Sad', emoji: '😢', color: '#45B7D1', speech: 'Where is the sad face?' },
      { id: 3, name: 'Angry', emoji: '😡', color: '#FF4757', speech: 'Touch the angry face' },
      { id: 4, name: 'Surprised', emoji: '😲', color: '#A29BFE', speech: 'Can you find the surprised face?' },
      { id: 5, name: 'Sleepy', emoji: '😴', color: '#747D8C', speech: 'Find the sleepy face' },
      { id: 6, name: 'Scared', emoji: '😨', color: '#5758BB', speech: 'Where is the scared face?' },
      { id: 7, name: 'Laughing', emoji: '😂', color: '#FECA57', speech: 'Touch the laughing face' },
      { id: 8, name: 'Cool', emoji: '😎', color: '#2E86DE', speech: 'Find the cool face' },
      { id: 9, name: 'Loved', emoji: '🥰', color: '#FF6B6B', speech: 'Where is the face that feels loved?' },
      { id: 10, name: 'Silly', emoji: '🤪', color: '#1DD1A1', speech: 'Touch the silly face' },
      { id: 11, name: 'Thinking', emoji: '🤔', color: '#D1D8E0', speech: 'Find the thinking face' },
      { id: 12, name: 'Bored', emoji: '😑', color: '#A5A5A5', speech: 'Where is the bored face?' },
      { id: 13, name: 'Shy', emoji: '😊', color: '#FFBE76', speech: 'Touch the shy face' },
      { id: 14, name: 'Hungry', emoji: '🤤', color: '#F39C12', speech: 'Find the hungry face' },
      { id: 15, name: 'Sick', emoji: '🤢', color: '#26DE81', speech: 'Where is the sick face?' }
    ],
    Level2: [
      { id: 'e_l2_1', instruction: "Someone gave you a surprise gift!", audioText: "Wow! Someone just gave you a big surprise gift! How do you feel?", options: [{ id: 1, emoji: '😲', label: 'Surprised', isCorrect: true }, { id: 2, emoji: '😴', label: 'Sleepy', isCorrect: false }, { id: 3, emoji: '😡', label: 'Angry', isCorrect: false }] },
      { id: 'e_l2_2', instruction: "You are playing with your friends!", audioText: "You are having so much fun playing with your friends! Which face shows how you feel?", options: [{ id: 1, emoji: '😊', label: 'Happy', isCorrect: true }, { id: 2, emoji: '😢', label: 'Sad', isCorrect: false }, { id: 3, emoji: '😤', label: 'Upset', isCorrect: false }] },
      { id: 'e_l2_3', instruction: "Your ice cream fell on the ground.", audioText: "Oh no! Your ice cream fell on the ground. How do you feel now?", options: [{ id: 1, emoji: '😢', label: 'Sad', isCorrect: true }, { id: 2, emoji: '🤩', label: 'Happy', isCorrect: false }, { id: 3, emoji: '😴', label: 'Sleepy', isCorrect: false }] },
      { id: 'e_l2_4', instruction: "It is very late and time for bed.", audioText: "The sun is gone and it is very late. You want to go to sleep. Which one are you?", options: [{ id: 1, emoji: '😴', label: 'Sleepy', isCorrect: true }, { id: 2, emoji: '😡', label: 'Angry', isCorrect: false }, { id: 3, emoji: '😊', label: 'Happy', isCorrect: false }] },
      { id: 'e_l2_5', instruction: "Someone took your favorite toy!", audioText: "Hey! Someone took your toy without asking. How does that make you feel?", options: [{ id: 1, emoji: '😡', label: 'Angry', isCorrect: true }, { id: 2, emoji: '😊', label: 'Happy', isCorrect: false }, { id: 3, emoji: '😲', label: 'Surprised', isCorrect: false }] },
      { id: 'e_l2_6', instruction: "You saw a giant, colorful rainbow!", audioText: "Look up at the sky! A beautiful rainbow! How do you look when you see it?", options: [{ id: 1, emoji: '🤩', label: 'Amazed', isCorrect: true }, { id: 2, emoji: '😢', label: 'Sad', isCorrect: false }, { id: 3, emoji: '😴', label: 'Sleepy', isCorrect: false }] },
      { id: 'e_l2_7', instruction: "You are scared of the dark.", audioText: "It's very dark and you hear a strange noise. Which face shows you are scared?", options: [{ id: 1, emoji: '😨', label: 'Scared', isCorrect: true }, { id: 2, emoji: '😊', label: 'Happy', isCorrect: false }, { id: 3, emoji: '😋', label: 'Yum', isCorrect: false }] },
      { id: 'e_l2_8', instruction: "You are eating your favorite cake!", audioText: "Mmm, this cake is so delicious! Which face shows you like the taste?", options: [{ id: 1, emoji: '😋', label: 'Yum', isCorrect: true }, { id: 2, emoji: '😢', label: 'Sad', isCorrect: false }, { id: 3, emoji: '😡', label: 'Angry', isCorrect: false }] },
      { id: 'e_l2_9', instruction: "You are feeling sick.", audioText: "Oh, your tummy hurts and you feel a bit sick. Which face is it?", options: [{ id: 1, emoji: '🤒', label: 'Sick', isCorrect: true }, { id: 2, emoji: '🥳', label: 'Party', isCorrect: false }, { id: 3, emoji: '😲', label: 'Surprised', isCorrect: false }] },
      { id: 'e_l2_10', instruction: "It's your birthday party!", audioText: "Happy Birthday! All your family is here and there is a big cake! How do you feel?", options: [{ id: 1, emoji: '🥳', label: 'Party', isCorrect: true }, { id: 2, emoji: '😴', label: 'Sleepy', isCorrect: false }, { id: 3, emoji: '😢', label: 'Sad', isCorrect: false }] }
    ]
  },
  Family: {
    Level1: [
      { id: 1, name: 'Mother', emoji: '👩', color: '#FF7F50', speech: 'Find the mother' },
      { id: 2, name: 'Father', emoji: '👨', color: '#54A0FF', speech: 'Where is the father?' },
      { id: 3, name: 'Brother', emoji: '👦', color: '#1DD1A1', speech: 'Touch the brother' },
      { id: 4, name: 'Sister', emoji: '👧', color: '#FF9FF3', speech: 'Find the sister' },
      { id: 5, name: 'Grandmother', emoji: '👵', color: '#FECA57', speech: 'Where is the grandmother?' },
      { id: 6, name: 'Grandfather', emoji: '👴', color: '#747D8C', speech: 'Touch the grandfather' },
      { id: 7, name: 'Baby', emoji: '👶', color: '#48DBFB', speech: 'Where is the baby?' }
    ],
    Level2: [
      { id: 'f_l2_1', instruction: "Who tells us the best bedtime stories?", audioText: "It's story time! Who is the kind lady with glasses that tells us the best stories?", options: [{ id: 1, emoji: '👵', label: 'Grandma', isCorrect: true }, { id: 2, emoji: '👦', label: 'Brother', isCorrect: false }, { id: 3, emoji: '👶', label: 'Baby', isCorrect: false }] },
      { id: 'f_l2_2', instruction: "Who plays football with you in the park?", audioText: "Goal! You are playing football in the park. Who is the strong man playing with you?", options: [{ id: 1, emoji: '👨', label: 'Father', isCorrect: true }, { id: 2, emoji: '👧', label: 'Sister', isCorrect: false }, { id: 3, emoji: '👵', label: 'Grandma', isCorrect: false }] },
      { id: 'f_l2_3', instruction: "Who is the smallest member of the family?", audioText: "Wah-wah! This person is very small and drinks milk from a bottle. Who is it?", options: [{ id: 1, emoji: '👶', label: 'Baby', isCorrect: true }, { id: 2, emoji: '👴', label: 'Grandpa', isCorrect: false }, { id: 3, emoji: '👨', label: 'Father', isCorrect: false }] },
      { id: 'f_l2_4', instruction: "Who gives the warmest hugs and cooks yummy food?", audioText: "Mmm, something smells good! Who is the lady that gives the warmest hugs?", options: [{ id: 1, emoji: '👩', label: 'Mother', isCorrect: true }, { id: 2, emoji: '👦', label: 'Brother', isCorrect: false }, { id: 3, emoji: '👶', label: 'Baby', isCorrect: false }] },
      { id: 'f_l2_5', instruction: "Who shares toys with you and plays games?", audioText: "Let's play together! Who is the boy in the house that shares his toys with you?", options: [{ id: 1, emoji: '👦', label: 'Brother', isCorrect: true }, { id: 2, emoji: '👴', label: 'Grandpa', isCorrect: false }, { id: 3, emoji: '👩', label: 'Mother', isCorrect: false }] },
      { id: 'f_l2_6', instruction: "Who walks with a stick and smiles a lot?", audioText: "He is very wise and walks slowly with his stick. Who is this kind man?", options: [{ id: 1, emoji: '👴', label: 'Grandpa', isCorrect: true }, { id: 2, emoji: '👧', label: 'Sister', isCorrect: false }, { id: 3, emoji: '👶', label: 'Baby', isCorrect: false }] },
      { id: 'f_l2_7', instruction: "Who likes to play with dolls and braid her hair?", audioText: "She has long hair and loves to play with her dolls. Which one is your sister?", options: [{ id: 1, emoji: '👧', label: 'Sister', isCorrect: true }, { id: 2, emoji: '👨', label: 'Father', isCorrect: false }, { id: 3, emoji: '👴', label: 'Grandpa', isCorrect: false }] },
      { id: 'f_l2_8', instruction: "Who is the Father of your Father?", audioText: "Think carefully! Who is the father of your daddy?", options: [{ id: 1, emoji: '👴', label: 'Grandpa', isCorrect: true }, { id: 2, emoji: '👦', label: 'Brother', isCorrect: false }, { id: 3, emoji: '👩', label: 'Mother', isCorrect: false }] },
      { id: 'f_l2_9', instruction: "Who uses a stroller for a walk?", audioText: "We are going for a walk! Who sits in the stroller and says 'goo-goo'?", options: [{ id: 1, emoji: '👶', label: 'Baby', isCorrect: true }, { id: 2, emoji: '👨', label: 'Father', isCorrect: false }, { id: 3, emoji: '👧', label: 'Sister', isCorrect: false }] },
      { id: 'f_l2_10', instruction: "Who is the Mother of your Mother?", audioText: "Who is the mother of your mommy? She loves you very much!", options: [{ id: 1, emoji: '👵', label: 'Grandma', isCorrect: true }, { id: 2, emoji: '👴', label: 'Grandpa', isCorrect: false }, { id: 3, emoji: '👧', label: 'Sister', isCorrect: false }] }
    ]
  },
  BodyParts: {
    Level1: [
      { id: 1, name: 'Eye', emoji: '👁️', color: '#45B7D1', speech: 'Find the eye' },
      { id: 2, name: 'Nose', emoji: '👃', color: '#FF6B6B', speech: 'Where is the nose?' },
      { id: 3, name: 'Ear', emoji: '👂', color: '#F7DC6F', speech: 'Touch the ear' },
      { id: 4, name: 'Hand', emoji: '🖐️', color: '#96CEB4', speech: 'Where is the hand?' },
      { id: 5, name: 'Foot', emoji: '🦶', color: '#A5A5A5', speech: 'Find the foot' },
      { id: 6, name: 'Mouth', emoji: '👄', color: '#FF4757', speech: 'Touch the mouth' },
      { id: 7, name: 'Tongue', emoji: '👅', color: '#FF9FF3', speech: 'Find the tongue' },
      { id: 8, name: 'Teeth', emoji: '🦷', color: '#DFE4EA', speech: 'Where are the teeth?' },
      { id: 9, name: 'Finger', emoji: '☝️', color: '#FECA57', speech: 'Touch the finger' },
      { id: 11, name: 'Arm', emoji: '💪', color: '#5F27CD', speech: 'Where is the arm?' },
      { id: 12, name: 'Hair', emoji: '💇', color: '#2F3542', speech: 'Find the hair' },
      { id: 14, name: 'Leg', emoji: '🦵', color: '#2ED573', speech: 'Find the leg' },
      { id: 15, name: 'Nail', emoji: '💅', color: '#FD79A8', speech: 'Touch the nail' },
      { id: 16, name: 'Stomach', emoji: '🤰', color: '#ECCC68', speech: 'Where is the stomach?' }
    ],
    Level2: [
      { id: 'bp_l2_1', instruction: "Which one do we use to see?", audioText: "We see the stars and the rainbow. Which one do we use to see?", options: [{ id: 1, emoji: '👁️', label: 'Eye', isCorrect: true }, { id: 2, emoji: '👂', label: 'Ear', isCorrect: false }, { id: 3, emoji: '👃', label: 'Nose', isCorrect: false }] },
      { id: 'bp_l2_2', instruction: "Which one do we use to smell?", audioText: "Flowers smell so good! Which part of our body do we use to smell?", options: [{ id: 1, emoji: '👃', label: 'Nose', isCorrect: true }, { id: 2, emoji: '👄', label: 'Mouth', isCorrect: false }, { id: 3, emoji: '🖐️', label: 'Hand', isCorrect: false }] },
      { id: 'bp_l2_3', instruction: "Which one do we use to hear?", audioText: "Listen to the music! Which one do we use to hear sounds?", options: [{ id: 1, emoji: '👂', label: 'Ear', isCorrect: true }, { id: 2, emoji: '👁️', label: 'Eye', isCorrect: false }, { id: 3, emoji: '🦶', label: 'Foot', isCorrect: false }] },
      { id: 'bp_l2_4', instruction: "Which one do we use to taste?", audioText: "Yummy! Which one do we use to taste delicious ice cream?", options: [{ id: 1, emoji: '👅', label: 'Tongue', isCorrect: true }, { id: 2, emoji: '🦷', label: 'Teeth', isCorrect: false }, { id: 3, emoji: '🖐️', label: 'Hand', isCorrect: false }] },
      { id: 'bp_l2_5', instruction: "Which one do we use to chew food?", audioText: "Crunch crunch! Which one do we use to chew our food?", options: [{ id: 1, emoji: '🦷', label: 'Teeth', isCorrect: true }, { id: 2, emoji: '👂', label: 'Ear', isCorrect: false }, { id: 3, emoji: '👃', label: 'Nose', isCorrect: false }] },
      { id: 'bp_l2_6', instruction: "Which one do we use to run?", audioText: "Let's run fast! Which part of our body do we use to run?", options: [{ id: 1, emoji: '🦶', label: 'Foot', isCorrect: true }, { id: 2, emoji: '🖐️', label: 'Hand', isCorrect: false }, { id: 3, emoji: '👁️', label: 'Eye', isCorrect: false }] },
      { id: 'bp_l2_7', instruction: "Which one do we use to hold things?", audioText: "We can hold a pencil or a toy. Which one do we use to grab things?", options: [{ id: 1, emoji: '🖐️', label: 'Hand', isCorrect: true }, { id: 2, emoji: '🦶', label: 'Foot', isCorrect: false }, { id: 3, emoji: '👃', label: 'Nose', isCorrect: false }] },
      { id: 'bp_l2_8', instruction: "Where do we put a hat?", audioText: "It's sunny outside! Where do we put our hat?", options: [{ id: 1, emoji: '💇', label: 'Head', isCorrect: true }, { id: 2, emoji: '🦶', label: 'Foot', isCorrect: false }, { id: 3, emoji: '🖐️', label: 'Hand', isCorrect: false }] }
    ]
  },
Schools: {
    Level1: [
      { id: 1, name: 'Pencil', emoji: '✏️', color: '#FFD32A', speech: 'Find the pencil' },
      { id: 2, name: 'School Bag', emoji: '🎒', color: '#FF5E57', speech: 'Where is the school bag?' },
      { id: 3, name: 'Book', emoji: '📖', color: '#4ECDC4', speech: 'Touch the book' },
      { id: 4, name: 'Crayon', emoji: '🖍️', color: '#FF6B6B', speech: 'Find the colorful crayon' },
      { id: 5, name: 'Notebook', emoji: '📓', color: '#A5A5A5', speech: 'Where is the notebook?' },
      { id: 6, name: 'Eraser', emoji: '🧼', color: '#45B7D1', speech: 'Find the eraser' },
      { id: 7, name: 'Ruler', emoji: '📏', color: '#F7DC6F', speech: 'Touch the ruler' },
      { id: 9, name: 'Scissors', emoji: '✂️', color: '#EE5253', speech: 'Find the scissors' },
      { id: 10, name: 'Glue', emoji: '🧪', color: '#1DD1A1', speech: 'Touch the glue' },
      { id: 11, name: 'Globe', emoji: '🌍', color: '#54A0FF', speech: 'Where is the world globe?' },
     {id: 12, name: 'pencil case', emoji: '👝', color: '#FF9FF3', speech: 'Find the pencil case' }
    ],
    Level2: [
      {
        id: 'sch_l2_1',
        instruction: "Which one do we use to carry our books?",
        audioText: "Time for school! Which one do we use to carry all our books and pencils?",
        options: [
          { id: 1, emoji: '🎒', label: 'Bag', isCorrect: true },
          { id: 2, emoji: '🛏️', label: 'Bed', isCorrect: false },
          { id: 3, emoji: '🛀', label: 'Bath', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_2',
        instruction: "Which one do we use to write in?",
        audioText: "Let's do our homework! Which one do we use to write our notes in?",
        options: [
          { id: 1, emoji: '📓', label: 'Notebook', isCorrect: true },
          { id: 2, emoji: '🧼', label: 'Eraser', isCorrect: false },
          { id: 3, emoji: '🌍', label: 'Globe', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_3',
        instruction: "Which one do we use to draw a straight line?",
        audioText: "Look at this line! Which tool do we use to make it perfectly straight?",
        options: [
          { id: 1, emoji: '📏', label: 'Ruler', isCorrect: true },
          { id: 2, emoji: '🖍️', label: 'Crayon', isCorrect: false },
          { id: 3, emoji: '🎒', label: 'Bag', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_4',
        instruction: "Which one do we use to fix a mistake?",
        audioText: "Oh no, a mistake! Which one do we use to rub it away?",
        options: [
          { id: 1, emoji: '🧼', label: 'Eraser', isCorrect: true },
          { id: 2, emoji: '✏️', label: 'Pencil', isCorrect: false },
          { id: 3, emoji: '✂️', label: 'Scissors', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_5',
        instruction: "Which one do we use to color a picture?",
        audioText: "Let's make this drawing beautiful! Which one do we use to color it?",
        options: [
          { id: 1, emoji: '🖍️', label: 'Crayon', isCorrect: true },
          { id: 2, emoji: '📏', label: 'Ruler', isCorrect: false },
          { id: 3, emoji: '🧪', label: 'Glue', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_7',
        instruction: "Which one do we use to cut paper?",
        audioText: "We are making a paper craft! Which tool do we need to cut the paper?",
        options: [
          { id: 1, emoji: '✂️', label: 'Scissors', isCorrect: true },
          { id: 2, emoji: '✏️', label: 'Pencil', isCorrect: false },
          { id: 3, emoji: '🎒', label: 'Bag', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_8',
        instruction: "Which one helps us see the whole world?",
        audioText: "Where is Africa? Where is Asia? Which one shows us the whole world?",
        options: [
          { id: 1, emoji: '🌍', label: 'Globe', isCorrect: true },
          { id: 2, emoji: '🧼', label: 'Eraser', isCorrect: false },
          { id: 3, emoji: '📏', label: 'Ruler', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_9',
        instruction: "Which one do we use to stick papers together?",
        audioText: "Let's put these two papers together! Which one do we use to stick them?",
        options: [
          { id: 1, emoji: '🧪', label: 'Glue', isCorrect: true },
          { id: 2, emoji: '🖍️', label: 'Crayon', isCorrect: false },
          { id: 3, emoji: '📓', label: 'Notebook', isCorrect: false }
        ]
      },
      {
        id: 'sch_l2_10',
        instruction: "Which one do we use to write our name?",
        audioText: "Write your name right here! Which one do you need to write it?",
        options: [
          { id: 1, emoji: '✏️', label: 'Pencil', isCorrect: true },
          { id: 2, emoji: '🌍', label: 'Globe', isCorrect: false },
          { id: 3, emoji: '✂️', label: 'Scissors', isCorrect: false }
        ]
      },
      {
      id: 'sch_l2_11',
        instruction: "Where do we put our pencils and crayons?",
        audioText: "Your pencils are everywhere! Which one do we use to keep them together?",
        options: [
          { id: 1, emoji: '👝', label: 'Pencil Case', isCorrect: true },
          { id: 2, emoji: '🌍', label: 'Globe', isCorrect: false },
        { id: 3, emoji: '✂️', label: 'Scissors', isCorrect: false }
      ]
    }
    ]
  }

};