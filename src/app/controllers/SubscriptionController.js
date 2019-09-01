import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (req.userId === meetup.user_id) {
      return res
        .status(400)
        .json({ error: "You can't subscribe to you own meetup" });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "You can't subscribe to past meetup" });
    }

    /**
     * Select * from subscription a INNER JOIN meetup b on subscription.meetup_id = meetup.id Where a.user_id = req.userId AND b.date = meetup_date
     */
    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: meetup.date,
          },
        },
      ],
    });
    if (checkDate) {
      return res.status(400).json({
        error: "You can't subscribe in another meetup ate the same time",
      });
    }

    // Insert this data into BD table
    const subscription = await Subscription.create({
      meetup_id: meetup.id,
      user_id: req.userId,
    });
    return res.json(subscription);
  }
}

export default new SubscriptionController();
