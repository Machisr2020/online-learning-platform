
import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { BookOpen, Award, Users, Star } from 'lucide-react';

const LandingPage: React.FC = () => {
  // Sample course data
  const featuredCourses = [
    {
      id: 1,
      title: 'Introduction to React',
      instructor: 'Sarah Johnson',
      category: 'Web Development',
      rating: 4.9,
      students: 2351,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 2,
      title: 'Advanced JavaScript Concepts',
      instructor: 'Michael Chen',
      category: 'Programming',
      rating: 4.8,
      students: 1890,
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 3,
      title: 'UX/UI Design Fundamentals',
      instructor: 'Emma Rodriguez',
      category: 'Design',
      rating: 4.7,
      students: 1645,
      image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80'
    }
  ];

  const instructors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      subject: 'Web Development',
      courses: 12,
      students: 4500,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80'
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      subject: 'Programming',
      courses: 8,
      students: 3200,
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      subject: 'UX/UI Design',
      courses: 6,
      students: 2800,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      subject: 'Data Science',
      courses: 10,
      students: 3800,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Jessica Thompson',
      role: 'Front-end Developer',
      quote: 'The courses on this platform completely transformed my career. I went from knowing almost nothing about web development to landing a job as a front-end developer within 6 months.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
      id: 2,
      name: 'Daniel Lewis',
      role: 'UX Designer',
      quote: 'The instructors are industry professionals who provide real-world insights. The community is supportive, and the course materials are always up-to-date with the latest trends.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
      id: 3,
      name: 'Amanda Garcia',
      role: 'Data Analyst',
      quote: 'I was skeptical about online learning at first, but this platform changed my mind. The interactive exercises and projects helped me develop practical skills that I use every day in my job.',
      image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-lms-darker py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Master the <span className="text-lms-primary">trending tech skills</span> you need to succeed
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students learning from industry experts and transforming their careers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/#courses" className="lms-button-primary text-lg px-8 py-3">
                Explore Courses
              </Link>
              <Link to="/login" className="bg-transparent border border-lms-primary text-lms-primary hover:bg-lms-primary hover:text-white px-8 py-3 rounded-md transition-colors text-lg">
                Sign Up Free
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative rounded-2xl overflow-hidden border-2 border-lms-primary/20 shadow-lg shadow-lms-primary/10">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
                alt="Students learning together" 
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-lms-darker to-transparent opacity-60"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center animate-slide-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lms-primary/20 text-lms-primary mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-3xl font-bold text-white">250+</h3>
              <p className="text-gray-400">Online Courses</p>
            </div>
            
            <div className="flex flex-col items-center animate-slide-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lms-primary/20 text-lms-primary mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-3xl font-bold text-white">15k+</h3>
              <p className="text-gray-400">Active Students</p>
            </div>
            
            <div className="flex flex-col items-center animate-slide-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lms-primary/20 text-lms-primary mb-4">
                <Award size={28} />
              </div>
              <h3 className="text-3xl font-bold text-white">12k+</h3>
              <p className="text-gray-400">Certifications</p>
            </div>
            
            <div className="flex flex-col items-center animate-slide-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lms-primary/20 text-lms-primary mb-4">
                <Star size={28} />
              </div>
              <h3 className="text-3xl font-bold text-white">4.8</h3>
              <p className="text-gray-400">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-16 bg-lms-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Featured Courses</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore our most popular courses with high student satisfaction and industry-relevant content.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="lms-card group hover:transform hover:scale-105 transition-all duration-300">
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-lms-primary/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {course.category}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-lms-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-400 mb-3">by {course.instructor}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Star className="text-yellow-400 h-5 w-5 mr-1" />
                    <span className="text-white">{course.rating}</span>
                  </div>
                  <span className="text-gray-400">{course.students} students</span>
                </div>
                
                <button className="w-full py-2 border border-lms-primary text-lms-primary rounded-md hover:bg-lms-primary hover:text-white transition-colors">
                  View Course
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/login" className="lms-button-primary">
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Top Instructors */}
      <section id="trainers" className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Top Instructors</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Learn from industry experts with years of experience and exceptional teaching skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="lms-card text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-lms-primary">
                  <img src={instructor.image} alt={instructor.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">{instructor.name}</h3>
                <p className="text-lms-primary font-medium mb-3">{instructor.subject}</p>
                
                <div className="flex justify-around text-sm text-gray-400">
                  <div>
                    <p className="font-bold text-white">{instructor.courses}</p>
                    <p>Courses</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">{instructor.students.toLocaleString()}</p>
                    <p>Students</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-16 bg-lms-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">What Our Students Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Thousands of students have transformed their careers with our courses. Here's what they have to say.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="lms-card">
                <div className="flex mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="text-yellow-400 h-5 w-5" />
                  ))}
                </div>
                
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="about" className="py-16 bg-lms-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join thousands of students and transform your career with our industry-leading courses.
          </p>
          <Link to="/login" className="lms-button-primary text-lg px-10 py-3">
            Get Started Today
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
