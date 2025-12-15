// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';
// import User from './../models/User';

// dotenv.config();

// const seedAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI as string);

//     const superAdminExists = await User.findOne({ role: 'superadmin' });

//     if (superAdminExists) {
//       console.log('⚠️ Super Admin already exists!');
//       process.exit();
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash('super123', salt); 

//     await User.create({
//       username: 'System Owner',
//       email: 'super@mkd.com',
//       password: hashedPassword,
//       role: 'superadmin', 
//       gender: 'Male',
//       isVerified: true,
//     });

//     console.log('✅ Super Admin Created! (Email: super@mkd.com / Pass: super123)');
//     process.exit();

//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// seedAdmin();



import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const seedReceptionist = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    const email = "res@mkd.com"; 
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log("⚠️ Receptionist user already exists!");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("1234", salt);

    const receptionist = new User({
      username: "Reception Desk",
      email: email,
      password: hashedPassword,
      role: "receptionist",
      phone: "0112345678",
      gender: "Female"
    });

    await receptionist.save();

    console.log("🎉 Receptionist created successfully!");
    console.log("📧 Email: reception@mkd.com");
    console.log("🔑 Password: 123456");

    process.exit();

  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

seedReceptionist();