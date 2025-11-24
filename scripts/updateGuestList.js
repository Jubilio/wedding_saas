const fs = require('fs');
const path = require('path');

// Read the current guestList.json
const filePath = path.join(__dirname, '..', 'src', 'data', 'guestList.json');
console.log('Reading from:', filePath);

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Update each group to have maxGuests: 10 and expand guests array
data.groups = data.groups.map(function(group) {
  const currentGuests = group.guests || [];
  const updatedGuests = currentGuests.slice(); // Copy array
  
  // Fill with empty strings to reach 10 guests
  while (updatedGuests.length < 10) {
    updatedGuests.push('');
  }
  
  return Object.assign({}, group, {
    maxGuests: 10,
    guests: updatedGuests
  });
});

// Add 17th table if needed
if (data.groups.length < 17) {
  data.groups.push({
    "id": "binth-jubilio-17",
    "name": "Binth e Jubílio 17 - Reserva",
    "maxGuests": 10,
    "guests": ["", "", "", "", "", "", "", "", "", ""]
  });
}

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ guestList.json updated successfully!');
console.log('📊 Total tables:', data.groups.length);
console.log('👥 Total capacity:', data.groups.length * 10, 'guests');
