
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Quiz = require('./models/Quiz');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spacex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'.cyan.underline))
.catch(err => {
  console.error(`Error: ${err.message}`.red.underline.bold);
  process.exit(1);
});

// Sample users
const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'student'
  },
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    password: 'password123',
    role: 'student'
  },
  {
    firstName: 'Dr. Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    role: 'instructor'
  },
  {
    firstName: 'Prof. Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    password: 'password123',
    role: 'instructor'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  }
];

// Real courses with YouTube videos and proper modules
const sampleCourses = [
  {
    title: 'Complete React Development Course',
    description: 'Master React.js from basics to advanced concepts including hooks, context, and modern patterns',
    category: 'Web Development',
    level: 'Beginner',
    price: 2999,
    duration: 480,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        title: 'Introduction to React',
        description: 'Learn what React is and why it\'s popular for building user interfaces',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/Tn6-PIqc4UM',
        instructorNotes: 'https://example.com/notes/react-intro.pdf',
        duration: 45,
        order: 1,
        isPublished: true
      },
      {
        title: 'Components and JSX',
        description: 'Understanding React components and JSX syntax',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/DLX62G4lc44',
        instructorNotes: 'https://example.com/notes/components-jsx.pdf',
        duration: 60,
        order: 2,
        isPublished: true
      },
      {
        title: 'Props and State',
        description: 'Learn how to pass data between components and manage state',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/IYvD9oBCuJI',
        instructorNotes: 'https://example.com/notes/props-state.pdf',
        duration: 75,
        order: 3,
        isPublished: true
      },
      {
        title: 'React Hooks',
        description: 'Master useState, useEffect and other essential hooks',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/O6P86uwfdR0',
        instructorNotes: 'https://example.com/notes/react-hooks.pdf',
        duration: 90,
        order: 4,
        isPublished: true
      },
      {
        title: 'Building a Complete App',
        description: 'Put everything together by building a real-world application',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/Dorf8i6lCuk',
        instructorNotes: 'https://example.com/notes/complete-app.pdf',
        duration: 120,
        order: 5,
        isPublished: true
      }
    ]
  },
  {
    title: 'JavaScript Fundamentals',
    description: 'Learn JavaScript from scratch with practical examples and modern ES6+ features',
    category: 'Web Development',
    level: 'Beginner',
    price: 1999,
    duration: 360,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        title: 'JavaScript Basics',
        description: 'Variables, data types, and basic operations in JavaScript',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/hdI2bqOjy3c',
        instructorNotes: 'https://example.com/notes/js-basics.pdf',
        duration: 50,
        order: 1,
        isPublished: true
      },
      {
        title: 'Functions and Scope',
        description: 'Understanding functions, parameters, and variable scope',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/N8ap4k_1QEQ',
        instructorNotes: 'https://example.com/notes/functions-scope.pdf',
        duration: 65,
        order: 2,
        isPublished: true
      },
      {
        title: 'Arrays and Objects',
        description: 'Working with arrays and objects in JavaScript',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/W1NTK09o-vM',
        instructorNotes: 'https://example.com/notes/arrays-objects.pdf',
        duration: 70,
        order: 3,
        isPublished: true
      },
      {
        title: 'DOM Manipulation',
        description: 'Learn to interact with HTML elements using JavaScript',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/y17RuWkWdn8',
        instructorNotes: 'https://example.com/notes/dom-manipulation.pdf',
        duration: 85,
        order: 4,
        isPublished: true
      },
      {
        title: 'ES6+ Features',
        description: 'Modern JavaScript features: arrow functions, destructuring, promises',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/nZ1DMMsyVyI',
        instructorNotes: 'https://example.com/notes/es6-features.pdf',
        duration: 90,
        order: 5,
        isPublished: true
      }
    ]
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB',
    category: 'Web Development',
    level: 'Intermediate',
    price: 3999,
    duration: 540,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        title: 'Node.js Introduction',
        description: 'Understanding Node.js runtime and its core modules',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/TlB_eWDSMt4',
        instructorNotes: 'https://example.com/notes/nodejs-intro.pdf',
        duration: 60,
        order: 1,
        isPublished: true
      },
      {
        title: 'Express.js Framework',
        description: 'Building web applications with Express.js',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/L72fhGm1tfE',
        instructorNotes: 'https://example.com/notes/express-framework.pdf',
        duration: 90,
        order: 2,
        isPublished: true
      },
      {
        title: 'MongoDB and Mongoose',
        description: 'Database integration with MongoDB and Mongoose ODM',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/DZBGEVgL2eE',
        instructorNotes: 'https://example.com/notes/mongodb-mongoose.pdf',
        duration: 120,
        order: 3,
        isPublished: true
      },
      {
        title: 'Authentication and Secty',
        description: 'Implementing JWT authentication and secty best practices',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/mbsmsi7l3r4',
        instructorNotes: 'https://example.com/notes/auth-security.pdf',
        duration: 135,
        order: 4,
        isPublished: true
      },
      {
        title: 'RESTful APIs and Deployment',
        description: 'Building REST APIs and deploying to production',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/pKd0Rpw7O48',
        instructorNotes: 'https://example.com/notes/apis-deployment.pdf',
        duration: 135,
        order: 5,
        isPublished: true
      }
    ]
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis, visualization, and machine learning',
    category: 'Data Science',
    level: 'Beginner',
    price: 2499,
    duration: 420,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        title: 'Python Basics for Data Science',
        description: 'Python fundamentals: variables, loops, functions, and libraries',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/LHBE6Q9XlzI',
        instructorNotes: 'https://example.com/notes/python-basics.pdf',
        duration: 75,
        order: 1,
        isPublished: true
      },
      {
        title: 'NumPy and Pandas',
        description: 'Data manipulation and analysis with NumPy and Pandas',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/vmEHCJofslg',
        instructorNotes: 'https://example.com/notes/numpy-pandas.pdf',
        duration: 90,
        order: 2,
        isPublished: true
      },
      {
        title: 'Data Visualization',
        description: 'Creating charts and graphs with Matplotlib and Seaborn',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/UO98lJQ3QGI',
        instructorNotes: 'https://example.com/notes/data-visualization.pdf',
        duration: 85,
        order: 3,
        isPublished: true
      },
      {
        title: 'Machine Learning Basics',
        description: 'Introduction to machine learning with Scikit-learn',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/7eh4d6sabA0',
        instructorNotes: 'https://example.com/notes/ml-basics.pdf',
        duration: 100,
        order: 4,
        isPublished: true
      },
      {
        title: 'Real-world Data Project',
        description: 'Complete data science project from data collection to insights',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/r-uHLfvSwy8',
        instructorNotes: 'https://example.com/notes/real-world-project.pdf',
        duration: 70,
        order: 5,
        isPublished: true
      }
    ]
  },
  {
    title: 'UI/UX Design Fundamentals',
    description: 'Master the principles of user interface and user experience design',
    category: 'UI/UX Design',
    level: 'Beginner',
    price: 1799,
    duration: 300,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        title: 'Design Principles',
        description: 'Fundamental design principles: layout, color, typography',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/YqQx75OPRa0',
        instructorNotes: 'https://example.com/notes/design-principles.pdf',
        duration: 55,
        order: 1,
        isPublished: true
      },
      {
        title: 'User Research and Personas',
        description: 'Understanding users through research and creating personas',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/GnO7D5UaDig',
        instructorNotes: 'https://example.com/notes/user-research.pdf',
        duration: 60,
        order: 2,
        isPublished: true
      },
      {
        title: 'Wireframing and Prototyping',
        description: 'Creating wireframes and interactive prototypes',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/qpH7-KFWZRI',
        instructorNotes: 'https://example.com/notes/wireframing.pdf',
        duration: 65,
        order: 3,
        isPublished: true
      },
      {
        title: 'Visual Design and Tools',
        description: 'Creating beautiful interfaces using Figma and design systems',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
        instructorNotes: 'https://example.com/notes/visual-design.pdf',
        duration: 70,
        order: 4,
        isPublished: true
      },
      {
        title: 'Usability Testing',
        description: 'Testing designs with users and iterating based on feedback',
        contentType: 'video',
        content: 'https://www.youtube.com/embed/0YL0xoSmyZI',
        instructorNotes: 'https://example.com/notes/usability-testing.pdf',
        duration: 50,
        order: 5,
        isPublished: true
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();
    await Quiz.deleteMany();

    console.log('Data cleared'.red.inverse);

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    const instructors = createdUsers.filter(user => user.role === 'instructor');
    const students = createdUsers.filter(user => user.role === 'student');

    console.log('Users created'.green.inverse);

    // Create courses with instructors
    const coursesWithInstructors = sampleCourses.map((course, index) => ({
      ...course,
      instructor: instructors[index % instructors.length]._id
    }));

    const courses = await Course.insertMany(coursesWithInstructors);
    console.log('Courses created'.green.inverse);

    // Create enrollments for students
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Enroll each student in 2-3 courses
      const coursesToEnroll = courses.slice(0, 3);
      
      for (let j = 0; j < coursesToEnroll.length; j++) {
        const course = coursesToEnroll[j];
        
        // Create enrollment with some progress
        const completedModulesCount = Math.floor(Math.random() * course.modules.length);
        const completedModules = course.modules.slice(0, completedModulesCount).map(module => ({
          module: module._id,
          completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }));

        const enrollment = new Enrollment({
          student: student._id,
          course: course._id,
          completedModules: completedModules,
          progress: (completedModulesCount / course.modules.length) * 100,
          status: completedModulesCount === course.modules.length ? 'completed' : 'active',
          completedAt: completedModulesCount === course.modules.length ? new Date() : null,
          lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });

        await enrollment.save();
        
        // Update course enrollment count
        await Course.findByIdAndUpdate(course._id, {
          $inc: { enrollmentCount: 1 }
        });

        console.log(`Enrollment created for ${student.firstName} in ${course.title}`.yellow);
      }
    }

    console.log('Database seeded successfully with real YouTube videos!'.green.inverse);
    console.log(`Created ${createdUsers.length} users`.cyan);
    console.log(`Created ${courses.length} courses with modules`.cyan);
    console.log(`Created enrollments with progress tracking`.cyan);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();
    await Quiz.deleteMany();

    console.log('Data destroyed'.red.inverse);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
  }
};

if (process.argv[2] === '-d') {
  destroyData()
  .then(() => {
    mongoose.connection.close();
    process.exit();
  });
} else {
  seedDatabase()
  .then(() => {
    mongoose.connection.close();
    process.exit();
  });
}
