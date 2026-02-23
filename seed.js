const mongoose = require('mongoose');
const Vocabulary = require('./models/Vocabulary');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flashcard_english';

const seedData = [
    // ===== ANIMALS =====
    { word: 'Elephant', meaning: 'Con voi', phonetic: '/ˈelɪfənt/', example: 'The elephant is the largest land animal.', category: 'Animals' },
    { word: 'Dolphin', meaning: 'Cá heo', phonetic: '/ˈdɒlfɪn/', example: 'Dolphins are very intelligent creatures.', category: 'Animals' },
    { word: 'Butterfly', meaning: 'Con bướm', phonetic: '/ˈbʌtəflaɪ/', example: 'A beautiful butterfly landed on the flower.', category: 'Animals' },
    { word: 'Penguin', meaning: 'Chim cánh cụt', phonetic: '/ˈpeŋɡwɪn/', example: 'Penguins live in the Antarctic.', category: 'Animals' },
    { word: 'Eagle', meaning: 'Đại bàng', phonetic: '/ˈiːɡl/', example: 'The eagle soared high above the mountains.', category: 'Animals' },
    { word: 'Giraffe', meaning: 'Hươu cao cổ', phonetic: '/dʒɪˈrɑːf/', example: 'The giraffe has a very long neck.', category: 'Animals' },
    { word: 'Whale', meaning: 'Cá voi', phonetic: '/weɪl/', example: 'Blue whales are the largest animals ever lived.', category: 'Animals' },
    { word: 'Squirrel', meaning: 'Con sóc', phonetic: '/ˈskwɪrəl/', example: 'The squirrel collected nuts for winter.', category: 'Animals' },
    { word: 'Crocodile', meaning: 'Cá sấu', phonetic: '/ˈkrɒkədaɪl/', example: 'Crocodiles can live up to 70 years.', category: 'Animals' },
    { word: 'Parrot', meaning: 'Con vẹt', phonetic: '/ˈpærət/', example: 'The parrot can mimic human speech.', category: 'Animals' },

    // ===== FOOD =====
    { word: 'Avocado', meaning: 'Quả bơ', phonetic: '/ˌævəˈkɑːdoʊ/', example: 'I love avocado toast for breakfast.', category: 'Food' },
    { word: 'Cinnamon', meaning: 'Quế', phonetic: '/ˈsɪnəmən/', example: 'Add a pinch of cinnamon to the coffee.', category: 'Food' },
    { word: 'Broccoli', meaning: 'Bông cải xanh', phonetic: '/ˈbrɒkəli/', example: 'Broccoli is rich in vitamins.', category: 'Food' },
    { word: 'Mushroom', meaning: 'Nấm', phonetic: '/ˈmʌʃruːm/', example: 'I want mushroom soup for dinner.', category: 'Food' },
    { word: 'Pineapple', meaning: 'Quả dứa', phonetic: '/ˈpaɪnæpl/', example: 'Pineapple is a tropical fruit.', category: 'Food' },
    { word: 'Salmon', meaning: 'Cá hồi', phonetic: '/ˈsæmən/', example: 'Grilled salmon is my favorite dish.', category: 'Food' },
    { word: 'Vinegar', meaning: 'Giấm', phonetic: '/ˈvɪnɪɡər/', example: 'Add vinegar to the salad dressing.', category: 'Food' },
    { word: 'Noodle', meaning: 'Mì / Bún', phonetic: '/ˈnuːdl/', example: 'I had noodle soup for lunch.', category: 'Food' },
    { word: 'Ginger', meaning: 'Gừng', phonetic: '/ˈdʒɪndʒər/', example: 'Ginger tea is good for colds.', category: 'Food' },
    { word: 'Strawberry', meaning: 'Dâu tây', phonetic: '/ˈstrɔːbəri/', example: 'Strawberry cake is delicious.', category: 'Food' },

    // ===== TRAVEL =====
    { word: 'Passport', meaning: 'Hộ chiếu', phonetic: '/ˈpɑːspɔːrt/', example: 'Don\'t forget to bring your passport.', category: 'Travel' },
    { word: 'Luggage', meaning: 'Hành lý', phonetic: '/ˈlʌɡɪdʒ/', example: 'My luggage was lost at the airport.', category: 'Travel' },
    { word: 'Destination', meaning: 'Điểm đến', phonetic: '/ˌdestɪˈneɪʃn/', example: 'What is your travel destination?', category: 'Travel' },
    { word: 'Itinerary', meaning: 'Lịch trình', phonetic: '/aɪˈtɪnəreri/', example: 'Let me check the itinerary for tomorrow.', category: 'Travel' },
    { word: 'Accommodation', meaning: 'Chỗ ở', phonetic: '/əˌkɒməˈdeɪʃn/', example: 'We booked accommodation near the beach.', category: 'Travel' },
    { word: 'Souvenir', meaning: 'Quà lưu niệm', phonetic: '/ˌsuːvəˈnɪr/', example: 'I bought a souvenir for my family.', category: 'Travel' },
    { word: 'Currency', meaning: 'Tiền tệ', phonetic: '/ˈkʌrənsi/', example: 'What currency do they use in Japan?', category: 'Travel' },
    { word: 'Boarding pass', meaning: 'Thẻ lên máy bay', phonetic: '/ˈbɔːrdɪŋ pæs/', example: 'Please show your boarding pass.', category: 'Travel' },
    { word: 'Departure', meaning: 'Khởi hành', phonetic: '/dɪˈpɑːrtʃər/', example: 'The departure time is 8:00 AM.', category: 'Travel' },
    { word: 'Sightseeing', meaning: 'Tham quan', phonetic: '/ˈsaɪtsiːɪŋ/', example: 'We went sightseeing in Paris.', category: 'Travel' },

    // ===== BUSINESS =====
    { word: 'Revenue', meaning: 'Doanh thu', phonetic: '/ˈrevənjuː/', example: 'The company\'s revenue increased by 20%.', category: 'Business' },
    { word: 'Invoice', meaning: 'Hóa đơn', phonetic: '/ˈɪnvɔɪs/', example: 'Please send the invoice by email.', category: 'Business' },
    { word: 'Deadline', meaning: 'Hạn chót', phonetic: '/ˈdedlaɪn/', example: 'The deadline for the project is Friday.', category: 'Business' },
    { word: 'Negotiate', meaning: 'Đàm phán', phonetic: '/nɪˈɡoʊʃieɪt/', example: 'We need to negotiate the contract terms.', category: 'Business' },
    { word: 'Stakeholder', meaning: 'Bên liên quan', phonetic: '/ˈsteɪkhoʊldər/', example: 'All stakeholders must approve the plan.', category: 'Business' },
    { word: 'Profit', meaning: 'Lợi nhuận', phonetic: '/ˈprɒfɪt/', example: 'The profit margin is very high.', category: 'Business' },
    { word: 'Colleague', meaning: 'Đồng nghiệp', phonetic: '/ˈkɒliːɡ/', example: 'My colleague helped me with the report.', category: 'Business' },
    { word: 'Strategy', meaning: 'Chiến lược', phonetic: '/ˈstrætədʒi/', example: 'We need a new marketing strategy.', category: 'Business' },
    { word: 'Budget', meaning: 'Ngân sách', phonetic: '/ˈbʌdʒɪt/', example: 'The budget for this quarter is limited.', category: 'Business' },
    { word: 'Presentation', meaning: 'Bài thuyết trình', phonetic: '/ˌpreznˈteɪʃn/', example: 'I have a presentation at 2 PM.', category: 'Business' },

    // ===== DAILY LIFE =====
    { word: 'Appointment', meaning: 'Cuộc hẹn', phonetic: '/əˈpɔɪntmənt/', example: 'I have a doctor\'s appointment today.', category: 'Daily Life' },
    { word: 'Laundry', meaning: 'Giặt giũ', phonetic: '/ˈlɔːndri/', example: 'I need to do the laundry tonight.', category: 'Daily Life' },
    { word: 'Grocery', meaning: 'Tạp hóa', phonetic: '/ˈɡroʊsəri/', example: 'Let\'s go to the grocery store.', category: 'Daily Life' },
    { word: 'Commute', meaning: 'Đi lại (đi làm)', phonetic: '/kəˈmjuːt/', example: 'My daily commute takes 30 minutes.', category: 'Daily Life' },
    { word: 'Schedule', meaning: 'Lịch trình', phonetic: '/ˈskedʒuːl/', example: 'What\'s your schedule for today?', category: 'Daily Life' },
    { word: 'Exercise', meaning: 'Tập thể dục', phonetic: '/ˈeksərsaɪz/', example: 'I exercise every morning.', category: 'Daily Life' },
    { word: 'Neighbor', meaning: 'Hàng xóm', phonetic: '/ˈneɪbər/', example: 'My neighbor is very friendly.', category: 'Daily Life' },
    { word: 'Recipe', meaning: 'Công thức nấu ăn', phonetic: '/ˈresɪpi/', example: 'Can you share your recipe for this cake?', category: 'Daily Life' },
    { word: 'Furniture', meaning: 'Nội thất', phonetic: '/ˈfɜːrnɪtʃər/', example: 'We bought new furniture for the living room.', category: 'Daily Life' },
    { word: 'Electricity', meaning: 'Điện', phonetic: '/ɪˌlekˈtrɪsɪti/', example: 'The electricity bill was very high this month.', category: 'Daily Life' },

    // ===== TECHNOLOGY =====
    { word: 'Algorithm', meaning: 'Thuật toán', phonetic: '/ˈælɡərɪðəm/', example: 'The search algorithm is very efficient.', category: 'Technology' },
    { word: 'Database', meaning: 'Cơ sở dữ liệu', phonetic: '/ˈdeɪtəbeɪs/', example: 'All user data is stored in the database.', category: 'Technology' },
    { word: 'Bandwidth', meaning: 'Băng thông', phonetic: '/ˈbændwɪdθ/', example: 'We need more bandwidth for streaming.', category: 'Technology' },
    { word: 'Encryption', meaning: 'Mã hóa', phonetic: '/ɪnˈkrɪpʃn/', example: 'Encryption protects your data from hackers.', category: 'Technology' },
    { word: 'Artificial Intelligence', meaning: 'Trí tuệ nhân tạo', phonetic: '/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/', example: 'AI is changing the world rapidly.', category: 'Technology' },
    { word: 'Cybersecurity', meaning: 'An ninh mạng', phonetic: '/ˌsaɪbərsɪˈkjʊrɪti/', example: 'Cybersecurity is essential for online safety.', category: 'Technology' },
    { word: 'Cloud Computing', meaning: 'Điện toán đám mây', phonetic: '/klaʊd kəmˈpjuːtɪŋ/', example: 'Many companies use cloud computing services.', category: 'Technology' },
    { word: 'Debugging', meaning: 'Gỡ lỗi', phonetic: '/diːˈbʌɡɪŋ/', example: 'Debugging code can be time-consuming.', category: 'Technology' },
    { word: 'Interface', meaning: 'Giao diện', phonetic: '/ˈɪntərfeɪs/', example: 'The user interface is very intuitive.', category: 'Technology' },
    { word: 'Prototype', meaning: 'Nguyên mẫu', phonetic: '/ˈproʊtətaɪp/', example: 'We built a prototype to test the concept.', category: 'Technology' }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const count = await Vocabulary.countDocuments();
        if (count > 0) {
            console.log(`ℹ️  Database already has ${count} words. Skipping seed.`);
            console.log('   To re-seed, drop the collection first: db.vocabularies.drop()');
        } else {
            await Vocabulary.insertMany(seedData);
            console.log(`🌱 Seeded ${seedData.length} words into database!`);
        }

        await mongoose.disconnect();
        console.log('✅ Done!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

seed();
