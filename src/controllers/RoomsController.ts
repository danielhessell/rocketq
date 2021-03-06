/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { Request, Response } from 'express';

import { Database } from '../database/connection';

class RoomsController {
  async create(request: Request, response: Response): Promise<void> {
    const db = await Database();

    const { password } = request.body;

    let roomId: string;
    let isRoom = true;

    while (isRoom) {
      for (let i = 0; i < 6; i++) {
        if (i === 0) roomId = Math.floor(Math.random() * 10).toString();
        if (i !== 0) roomId += Math.floor(Math.random() * 10).toString();
      }

      const roomsId = await db.all(`SELECT id FROM rooms`);

      isRoom = roomsId.some(id => id === roomId);

      if (!isRoom) {
        await db.run(`
          INSERT INTO rooms (id, password)
          VALUES (${Number(roomId)}, ${password})
        `);
      }
    }

    await db.close();

    return response.redirect(`/room/${roomId}`);
  }

  async open(request: Request, response: Response): Promise<void> {
    const db = await Database();

    const { roomId } = request.params;

    const questions = await db.all(
      `SELECT * FROM questions WHERE roomId = ${roomId} and read = 0`,
    );

    const questionsRead = await db.all(
      `SELECT * FROM questions WHERE roomId = ${roomId} and read = 1`,
    );

    let hasQuestions = true;
    if (questions.length === 0 && questionsRead.length === 0) {
      hasQuestions = false;
    }

    await db.close();

    return response.render('room', {
      roomId,
      questions,
      questionsRead,
      hasQuestions,
    });
  }

  async enter(request: Request, response: Response): Promise<void> {
    const { roomId } = request.body;

    return response.redirect(`/room/${roomId}`);
  }
}

export { RoomsController };
