'use strict';

class FriendsController {
    static addNewFriend(req, res, next) {
        req.user.friendsController.addFriendByID(req.body.id)
            .then(() => {
                res.JSONAnswer(StringResources.answers.ADD_FRIEND, StringResources.answers.OK);
            })
            .catch(next);
    }

    static deleteFriend(req, res, next) {
        req.user.friendsController.removeFriendByID(req.body.id)
            .then(() => {
                res.JSONAnswer(StringResources.answers.DELETE_FRIEND, StringResources.answers.OK);
            })
            .catch(next);
    }

    static getAllFriends(req, res, next) {
        req.user.friendsController.getAllFriends()
            .then((friends) => {
                var friendsJSON = friends.map(client => client.toJSON());

                res.JSONAnswer(StringResources.answers.ALL_FRIENDS, friendsJSON);
            })
            .catch(next);
    }

    static findClients(req, res, next) {
        //TODO: перенсти в другой контроллер?
    }
}

module.exports = FriendsController;