const socket = io();

let username = '';

const loginScreen = document.getElementById('loginScreen');
const chatContainer = document.getElementById('chatContainer');
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('nameInput');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Store the last rendered date
let lastRenderedDate = '';

// Generate random name
function randomName() {
  const adjectives = ['Silent', 'Crazy', 'Cool', 'Sneaky', 'Witty', 'Fast'];
  const animals = ['Fox', 'Panda', 'Tiger', 'Wolf', 'Eagle', 'Dolphin'];
  return adjectives[Math.floor(Math.random() * adjectives.length)] + animals[Math.floor(Math.random() * animals.length)];
}

// Format date as e.g. '13 May 2025'
function formatDate(dateObj) {
  return dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

// Format time as e.g. '12:31 PM'
function formatTime(dateObj) {
  return dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// Set initial random name
nameInput.value = randomName();

// Add animation to login transition
startBtn.addEventListener('click', () => {
  username = nameInput.value.trim() || randomName();
  loginScreen.style.opacity = '0';
  loginScreen.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    loginScreen.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    chatContainer.style.opacity = '0';
    chatContainer.style.transform = 'translateY(20px)';
    
    // Trigger reflow
    chatContainer.offsetHeight;
    
    chatContainer.style.opacity = '1';
    chatContainer.style.transform = 'translateY(0)';
  }, 300);
});

// Add smooth message sending
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    const now = new Date();
    const timestamp = now.toISOString(); // Use ISO for easier parsing
    socket.emit('chat message', { user: username, text: input.value, time: timestamp });
    
    // Add sending animation
    const button = form.querySelector('button');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    input.value = '';
  }
});

// Add smooth message receiving
socket.on('chat message', (msg) => {
  // Only render if msg.text is a string and not empty, and msg.user exists
  if (
    typeof msg.text !== 'string' ||
    !msg.text.trim() ||
    typeof msg.user !== 'string' ||
    !msg.user.trim()
  ) {
    return; // Skip rendering this message
  }

  // Parse the date from msg.time (should be ISO string)
  let msgDateObj;
  try {
    msgDateObj = new Date(msg.time);
  } catch {
    msgDateObj = new Date();
  }
  const msgDate = formatDate(msgDateObj);
  const msgTime = formatTime(msgDateObj);

  // If the date is different from the last rendered date, insert a date separator
  if (msgDate !== lastRenderedDate) {
    const dateSeparator = document.createElement('li');
    dateSeparator.className = 'date-separator';
    dateSeparator.textContent = msgDate;
    messages.appendChild(dateSeparator);
    lastRenderedDate = msgDate;
  }

  const item = document.createElement('li');
  item.className = `message ${msg.user === username ? 'sent' : 'received'}`;
  
  const messageHeader = document.createElement('div');
  messageHeader.className = 'message-header';
  
  const userName = document.createElement('strong');
  userName.textContent = msg.user === username ? 'You' : msg.user;
  
  const timeStamp = document.createElement('span');
  timeStamp.className = 'timestamp';
  timeStamp.textContent = msgTime;
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = msg.text;
  
  messageHeader.appendChild(userName);
  messageHeader.appendChild(timeStamp);
  
  item.appendChild(messageHeader);
  item.appendChild(messageContent);
  
  messages.appendChild(item);
  
  // Trigger animation
  requestAnimationFrame(() => {
    item.classList.add('message-enter-active');
  });
  
  // Smooth scroll to bottom
  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: 'smooth'
  });
});

// Add input focus animation
input.addEventListener('focus', () => {
  input.parentElement.classList.add('focused');
});

input.addEventListener('blur', () => {
  input.parentElement.classList.remove('focused');
});
