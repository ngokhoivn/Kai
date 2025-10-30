function generateQuestions(character) {
    const questions = [
        {
            question: `このひと は だれですか？`, // Who is this person?
            translation: 'Người này là ai?',
            correctOrder: [character.name, 'です。'],
            blocks: [character.name, 'です。']
        },
        {
            question: `このひと は ことし なんさいですか？`, // How old is this person this year?
            translation: 'Người này năm nay bao nhiêu tuổi?',
            correctOrder: [character.details['年齢 (ねんれい)'], 'です。'],
            blocks: [character.details['年齢 (ねんれい)'], 'です。']
        },
        {
            question: `このひと は どこのくにのひとですか？`, // What country is this person from?
            translation: 'Người này người nước nào?',
            correctOrder: [character.details['国籍 (こくせき)'] + 'じん', 'です。'],
            blocks: [character.details['国籍 (こくせき)'] + 'じん', 'です。']
        },
        {
            question: `このひと は おとこのひとですか、おんなのひとですか？`, // Is this person male or female?
            translation: 'Người này là nam hay nữ?',
            correctOrder: [character.details['性別 (せいべつ)'], 'です。'],
            blocks: [character.details['性別 (せいべつ)'], 'です。']
        },
        {
            question: `このひと の しゅっしん は どこですか？`, // Where is this person from?
            translation: 'Người này quê ở đâu?',
            correctOrder: ['しゅっしん は', character.details['出身 (しゅっしん)'], 'です。'],
            blocks: ['しゅっしん は', character.details['出身 (しゅっしん)'], 'です。']
        },
        {
            question: `このひと の まえのしごと は なんでしたか？`, // What was this person's previous job?
            translation: 'Người này trước đây làm công việc gì?',
            correctOrder: ['まえのしごと は', character.details['前の仕事 (まえのしごと)'], 'でした。'],
            blocks: ['まえのしごと は', character.details['前の仕事 (まえのしごと)'], 'でした。']
        },
        {
            question: `このひと の いまのしごと は なんですか？`, // What is this person's current job?
            translation: 'Người này hiện tại làm công việc gì?',
            correctOrder: ['いまのしごと は', character.details['今の仕事 (いまのしごと)'], 'です。'],
            blocks: ['いまのしごと は', character.details['今の仕事 (いまのしごと)'], 'です。']
        }
    ];

    // Question 8
    if (character.details['今の仕事 (いまのしごと)'] === '会社員 (かいしゃいん)') {
        questions.push({
            question: `このひと は かいしゃいんですか？`,
            translation: 'Người này có phải làm nhân viên công ty không?',
            correctOrder: ['はい、', 'そうです。'],
            blocks: ['はい、', 'そうです。']
        });
    } else {
        questions.push({
            question: `このひと は かいしゃいんですか？`,
            translation: 'Người này có phải làm nhân viên công ty không?',
            correctOrder: ['いいえ、', 'ちがいます。', character.details['今の仕事 (いまのしごと)'], 'です。'],
            blocks: ['いいえ、', 'ちがいます。', character.details['今の仕事 (いまのしごと)'], 'です。']
        });
    }

    // Question 9
    if (character.details['前の仕事 (まえのしごと)'] === 'エンジニア') {
        questions.push({
            question: `このひと は まえに エンジニアでしたか？`,
            translation: 'Người này trước đây có phải kĩ sư không?',
            correctOrder: ['はい、', 'そうでした。'],
            blocks: ['はい、', 'そうでした。']
        });
    } else {
        questions.push({
            question: `このひと は まえに エンジニアでしたか？`,
            translation: 'Người này trước đây có phải kĩ sư không?',
            correctOrder: ['いいえ、', 'ちがいます。', 'まえのしごと は', character.details['前の仕事 (まえのしごと)'], 'でした。'],
            blocks: ['いいえ、', 'ちがいます。', 'まえのしごと は', character.details['前の仕事 (まえのしごと)'], 'でした。']
        });
    }

    return questions;
}
