import { parseISO, isBefore } from 'date-fns';
import * as Yup from 'yup';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });
    return res.json(meetups);
  }

  async store(req, res) {
    // Validação com YUP
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // parseISO transform date in format javascript

    const hourStart = parseISO(req.body.date);

    // isBefore get hourStart and compare with current date. If hourStart is before current date, not permitted
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // get data from req.body
    const user_id = req.userId;

    // Insert this data into BD table
    const meetup = await Meetup.create({
      ...req.body, // get all information pass to body of requisition
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    // Validação com YUP
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (req.userId !== meetup.user_id) {
      return res.status(401).json({ error: 'User not authorized.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    const hourStart = parseISO(req.body.date);

    // isBefore get hourStart and compare with current date. If hourStart is before current date, not permitted
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    await meetup.update(req.body);

    return res.json({ meetup });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups." });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
