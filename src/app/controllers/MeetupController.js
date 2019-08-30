import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    // get data from req.body
    const user_id = req.userId;

    // Insert this data into BD table
    const meetup = await Meetup.create({
      ...req.body, // get all information pass to body of requisition
      user_id,
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
