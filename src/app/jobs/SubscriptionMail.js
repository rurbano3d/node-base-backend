import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    console.log('A fila executou');
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: 'New subscribe to your meetup',
      template: 'subscription',
      context: {
        meetOwner: meetup.User.name,
        user: user.name,
        meetupName: meetup.title,
      },
    });
  }
}

export default new SubscriptionMail();
