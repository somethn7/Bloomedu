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
      { id: 'f_a1', instruction: "Which one says meow?", audioText: "Which one of these animals says meow?", options: [{ id: 1, emoji: '🐱', isCorrect: true }, { id: 2, emoji: '🦁', isCorrect: false }] },
      { id: 'f_a2', instruction: "Where does the dog live?", audioText: "Where is the house of the dog?", options: [{ id: 1, emoji: '🏠', isCorrect: true }, { id: 2, emoji: '🚗', isCorrect: false }] },
      { 
        id: 'f_a3', 
        instruction: "Which one says woof woof?", 
        audioText: "Which one of these animals says woof woof?", 
        options: [{ id: 1, emoji: '🐶', isCorrect: true }, { id: 2, emoji: '🐰', isCorrect: false }] 
      },
      { 
        id: 'f_a4', 
        instruction: "What does the rabbit like to eat?", 
        audioText: "Rabbits are hungry! What do they like to eat?", 
        options: [{ id: 1, emoji: '🥕', isCorrect: true }, { id: 2, emoji: '🥩', isCorrect: false }] 
      },
      { 
        id: 'f_a5', 
        instruction: "Which one can fly in the sky?", 
        audioText: "Look at the sky! Which one can fly?", 
        options: [{ id: 1, emoji: '🐦', isCorrect: true }, { id: 2, emoji: '🐢', isCorrect: false }] 
      },
      { 
        id: 'f_a6', 
        instruction: "Where does the fish live?", 
        audioText: "Fish need to swim! Where do they live?", 
        options: [{ id: 1, emoji: '🌊', isCorrect: true }, { id: 2, emoji: '🌳', isCorrect: false }] 
      },
      { 
        id: 'f_a7', 
        instruction: "Which one gives us milk?", 
        audioText: "Which animal gives us healthy milk?", 
        options: [{ id: 1, emoji: '🐮', isCorrect: true }, { id: 2, emoji: '🐍', isCorrect: false }] 
      },
      { 
        id: 'f_a8', 
        instruction: "Which one is very slow?", 
        audioText: "One of them is very slow. Can you find it?", 
        options: [{ id: 1, emoji: '🐢', isCorrect: true }, { id: 2, emoji: '🐆', isCorrect: false }] 
      },
      { 
        id: 'f_a9', 
        instruction: "Where does the bird live?", 
        audioText: "The bird wants to rest. Where is its home?", 
        options: [{ id: 1, emoji: '🪹', isCorrect: true }, { id: 2, emoji: '🛋️', isCorrect: false }] 
      },
      { 
        id: 'f_a10', 
        instruction: "Which one has a long trunk?", 
        audioText: "This animal is very big and has a long trunk. Which one is it?", 
        options: [{ id: 1, emoji: '🐘', isCorrect: true }, { id: 2, emoji: '🐭', isCorrect: false }] 
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
    Level2: []
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
    Level2: []
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
    Level2: []
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
    Level2: []
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
      { id: 'f_f1', instruction: "What does the monkey like to eat?", audioText: "Monkeys are hungry! What do they like to eat?", options: [{ id: 1, emoji: '🍌', isCorrect: true }, { id: 2, emoji: '🥩', isCorrect: false }] }
,
      { 
        id: 'f_f1', 
        instruction: "What does the monkey like to eat?", 
        audioText: "Monkeys are very hungry! What do they like to eat?", 
        options: [{ id: 1, emoji: '🍌', isCorrect: true }, { id: 2, emoji: '🥩', isCorrect: false }] 
      },
      { 
        id: 'f_f2', 
        instruction: "Which one is red?", 
        audioText: "Can you find the red fruit?", 
        options: [{ id: 1, emoji: '🍎', isCorrect: true }, { id: 2, emoji: '🍌', isCorrect: false }] 
      },
      { 
        id: 'f_f3', 
        instruction: "Which one is a summer fruit?", 
        audioText: "It's very hot! Which fruit is big, green and watery?", 
        options: [{ id: 1, emoji: '🍉', isCorrect: true }, { id: 2, emoji: '🥔', isCorrect: false }] 
      },
      { 
        id: 'f_f4', 
        instruction: "Where do apples grow?", 
        audioText: "Where can we find apples? On a tree or in the sea?", 
        options: [{ id: 1, emoji: '🌳', isCorrect: true }, { id: 2, emoji: '🌊', isCorrect: false }] 
      },
      { 
        id: 'f_f5', 
        instruction: "Which one is sour?", 
        audioText: "This fruit is very sour! Which one is it?", 
        options: [{ id: 1, emoji: '🍋', isCorrect: true }, { id: 2, emoji: '🍫', isCorrect: false }] 
      },
      { 
        id: 'f_f6', 
        instruction: "Which one is yellow?", 
        audioText: "Find the yellow fruit!", 
        options: [{ id: 1, emoji: '🍋', isCorrect: true }, { id: 2, emoji: '🍇', isCorrect: false }] 
      },
      { 
        id: 'f_f7', 
        instruction: "What do we need to make orange juice?", 
        audioText: "We want to drink juice! Which fruit do we use?", 
        options: [{ id: 1, emoji: '🍊', isCorrect: true }, { id: 2, emoji: '🥦', isCorrect: false }] 
      },
      { 
        id: 'f_f8', 
        instruction: "Which fruit has tiny seeds on it?", 
        audioText: "This red fruit has tiny seeds. Which one is it?", 
        options: [{ id: 1, emoji: '🍓', isCorrect: true }, { id: 2, emoji: '🥥', isCorrect: false }] 
      },
      { 
        id: 'f_f9', 
        instruction: "Which one is purple?", 
        audioText: "Find the purple grapes!", 
        options: [{ id: 1, emoji: '🍇', isCorrect: true }, { id: 2, emoji: '🍐', isCorrect: false }] 
      },
      { 
        id: 'f_f10', 
        instruction: "Which one is a tropical fruit?", 
        audioText: "This fruit has a crown! Can you find the pineapple?", 
        options: [{ id: 1, emoji: '🍍', isCorrect: true }, { id: 2, emoji: '🍅', isCorrect: false }] 
      }
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
    Level2: []
  },
  Objects: {
    Level1: [
      { id: 1, name: 'Pencil', emoji: '✏️', color: '#FFD32A', speech: 'Find the pencil' },
      { id: 2, name: 'School Bag', emoji: '🎒', color: '#FF5E57', speech: 'Where is the school bag?' }
    ],
    Level2: [
      { 
        id: 'f_o1', 
        instruction: "It's raining! Which one do we use?", 
        audioText: "It is raining! Which one do we use in the rain?", 
        options: [{ id: 1, emoji: '☔', isCorrect: true }, { id: 2, emoji: '☀️', isCorrect: false }] 
      },
      { 
        id: 'f_o2', 
        instruction: "Which one do we use to brush our teeth?", 
        audioText: "Time to clean our teeth! Which one do we use?", 
        options: [{ id: 1, emoji: '🪥', isCorrect: true }, { id: 2, emoji: '🥄', isCorrect: false }] 
      },
      { 
        id: 'f_o3', 
        instruction: "We are sleepy. Where do we sleep?", 
        audioText: "Good night! Where do we go to sleep?", 
        options: [{ id: 1, emoji: '🛏️', isCorrect: true }, { id: 2, emoji: '🚽', isCorrect: false }] 
      },
      { 
        id: 'f_o4', 
        instruction: "Our hands are dirty. What do we use?", 
        audioText: "Our hands are dirty. What do we use to wash them?", 
        options: [{ id: 1, emoji: '🧼', isCorrect: true }, { id: 2, emoji: '🖍️', isCorrect: false }] 
      },
      { 
        id: 'f_o5', 
        instruction: "Which one do we use to cut paper?", 
        audioText: "We want to cut this paper. Which tool do we need?", 
        options: [{ id: 1, emoji: '✂️', isCorrect: true }, { id: 2, emoji: '📏', isCorrect: false }] 
      },
      { 
        id: 'f_o6', 
        instruction: "It's dark. Which one gives us light?", 
        audioText: "It's very dark in here! What do we turn on for light?", 
        options: [{ id: 1, emoji: '💡', isCorrect: true }, { id: 2, emoji: '📦', isCorrect: false }] 
      },
      { 
        id: 'f_o7', 
        instruction: "We need to go to school. Where is our bag?", 
        audioText: "Time for school! Which one is our school bag?", 
        options: [{ id: 1, emoji: '🎒', isCorrect: true }, { id: 2, emoji: '📺', isCorrect: false }] 
      },
      { 
        id: 'f_o8', 
        instruction: "The floor is dirty. What do we use to clean?", 
        audioText: "Let's clean the floor! Which one do we use?", 
        options: [{ id: 1, emoji: '🧹', isCorrect: true }, { id: 2, emoji: '🧸', isCorrect: false }] 
      },
      { 
        id: 'f_o9', 
        instruction: "Which one do we use to write?", 
        audioText: "Let's draw or write something! What do we need?", 
        options: [{ id: 1, emoji: '✏️', isCorrect: true }, { id: 2, emoji: '👟', isCorrect: false }] 
      },
      { 
        id: 'f_o10', 
        instruction: "Which one do we wear on our feet?", 
        audioText: "We are going outside! What do we put on our feet?", 
        options: [{ id: 1, emoji: '👟', isCorrect: true }, { id: 2, emoji: '🕶️', isCorrect: false }] 
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
    Level2: []
  },
  BodyParts: {
    Level1: [
      { id: 1, name: 'Eye', emoji: '👁️', color: '#45B7D1', speech: 'Find the eye' },
      { id: 2, name: 'Nose', emoji: '👃', color: '#FF6B6B', speech: 'Where is the nose?' },
      { id: 3, name: 'Ear', emoji: '👂', color: '#F7DC6F', speech: 'Touch the ear' },
      { id: 4, name: 'Hand', emoji: '🖐️', color: '#96CEB4', speech: 'Where is the hand?' },
      { id: 5, name: 'Foot', emoji: '🦶', color: '#A5A5A5', speech: 'Find the foot' },
      { id: 6, name: 'Mouth', emoji: '👄', color: '#FF4757', speech: 'Touch the mouth' }
    ],
    Level2: []
  },
  Shapes: {
    Level1: [
      { id: 1, name: 'Square', emoji: '🟦', color: '#54A0FF', speech: 'Find the square' },
      { id: 2, name: 'Circle', emoji: '🔴', color: '#FF6B6B', speech: 'Where is the circle?' },
      { id: 3, name: 'Triangle', emoji: '🔺', color: '#1DD1A1', speech: 'Touch the triangle' },
      { id: 4, name: 'Star', emoji: '⭐', color: '#FECA57', speech: 'Find the star' }
    ],
    Level2: []
  }
};