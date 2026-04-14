import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import Quiz from '#models/quiz'
import Question from '#models/question'

export default class QuizSeeder extends BaseSeeder {
  async run() {
    const trx = await db.transaction()

    try {
      const quizzes = await Quiz.createMany(
        [
          {
            title: 'World Geography Challenge',
            description: 'Test your knowledge of countries, capitals, and natural wonders.',
            category: 'Geography',
            difficulty: 'medium',
            questionCount: 5,
          },
          {
            title: 'Fundamentals of Science',
            description: 'A mix of physics, chemistry, and biology questions.',
            category: 'Science',
            difficulty: 'easy',
            questionCount: 5,
          },
          {
            title: 'History Through the Ages',
            description: 'From ancient civilisations to the modern era.',
            category: 'History',
            difficulty: 'hard',
            questionCount: 5,
          },
        ],
        { client: trx }
      )

      const [geography, science, history] = quizzes

      await Question.createMany(
        [
          // ── Geography ──────────────────────────────────────────
          {
            quizId: geography.id,
            text: 'What is the longest river in the world?',
            options: JSON.stringify(['Amazon', 'Nile', 'Yangtze', 'Mississippi']),
            correctIndex: 1,
            points: 10,
            order: 1,
          },
          {
            quizId: geography.id,
            text: 'Which country has the most natural lakes?',
            options: JSON.stringify(['United States', 'Russia', 'Canada', 'Brazil']),
            correctIndex: 2,
            points: 10,
            order: 2,
          },
          {
            quizId: geography.id,
            text: 'Mount Kilimanjaro is located in which country?',
            options: JSON.stringify(['Kenya', 'Tanzania', 'Uganda', 'Ethiopia']),
            correctIndex: 1,
            points: 10,
            order: 3,
          },
          {
            quizId: geography.id,
            text: 'What is the smallest country in the world by area?',
            options: JSON.stringify(['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein']),
            correctIndex: 2,
            points: 10,
            order: 4,
          },
          {
            quizId: geography.id,
            text: 'The Sahara Desert is primarily located on which continent?',
            options: JSON.stringify(['Asia', 'South America', 'Africa', 'Australia']),
            correctIndex: 2,
            points: 10,
            order: 5,
          },

          // ── Science ────────────────────────────────────────────
          {
            quizId: science.id,
            text: 'What is the chemical symbol for gold?',
            options: JSON.stringify(['Go', 'Gd', 'Au', 'Ag']),
            correctIndex: 2,
            points: 10,
            order: 1,
          },
          {
            quizId: science.id,
            text: 'How many bones are in the adult human body?',
            options: JSON.stringify(['196', '206', '216', '186']),
            correctIndex: 1,
            points: 10,
            order: 2,
          },
          {
            quizId: science.id,
            text: 'What planet is known as the Red Planet?',
            options: JSON.stringify(['Venus', 'Jupiter', 'Mars', 'Saturn']),
            correctIndex: 2,
            points: 10,
            order: 3,
          },
          {
            quizId: science.id,
            text: 'What gas do plants absorb from the atmosphere during photosynthesis?',
            options: JSON.stringify(['Oxygen', 'Nitrogen', 'Hydrogen', 'Carbon dioxide']),
            correctIndex: 3,
            points: 10,
            order: 4,
          },
          {
            quizId: science.id,
            text: 'What is the speed of light in a vacuum (approx.)?',
            options: JSON.stringify([
              '300,000 km/s',
              '150,000 km/s',
              '3,000,000 km/s',
              '30,000 km/s',
            ]),
            correctIndex: 0,
            points: 10,
            order: 5,
          },

          // ── History ────────────────────────────────────────────
          {
            quizId: history.id,
            text: 'In which year did the Berlin Wall fall?',
            options: JSON.stringify(['1987', '1989', '1991', '1993']),
            correctIndex: 1,
            points: 10,
            order: 1,
          },
          {
            quizId: history.id,
            text: 'Who was the first Emperor of Rome?',
            options: JSON.stringify(['Julius Caesar', 'Nero', 'Augustus', 'Tiberius']),
            correctIndex: 2,
            points: 10,
            order: 2,
          },
          {
            quizId: history.id,
            text: 'The ancient city of Machu Picchu is located in which modern country?',
            options: JSON.stringify(['Bolivia', 'Peru', 'Ecuador', 'Colombia']),
            correctIndex: 1,
            points: 10,
            order: 3,
          },
          {
            quizId: history.id,
            text: 'Which war was fought between 1914 and 1918?',
            options: JSON.stringify([
              'World War II',
              'The Napoleonic Wars',
              'World War I',
              'The Crimean War',
            ]),
            correctIndex: 2,
            points: 10,
            order: 4,
          },
          {
            quizId: history.id,
            text: 'The Magna Carta was signed in which year?',
            options: JSON.stringify(['1066', '1215', '1485', '1603']),
            correctIndex: 1,
            points: 10,
            order: 5,
          },
        ],
        { client: trx }
      )

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
