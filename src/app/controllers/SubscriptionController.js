import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import Queue from '../../lib/Queue';
import User from '../models/User';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(), // gt = '>', date > new Date()
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [User],
    });

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

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
