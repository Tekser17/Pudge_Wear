import tornado.ioloop
import tornado.web
import json
from pymongo import MongoClient
from pandas import DataFrame

cluster = MongoClient("mongodb+srv://Tekser15:2159@cluster0.tc9nrxs.mongodb.net/Inventory?retryWrites=true&w=majority")
db = cluster["Inventory"]
inventory = db["Inventory_Collection"]
hero = db['Wear']


class mainpage(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')


class gamejs(tornado.web.RequestHandler):
    def get(self):
        self.render('game.js')


class takeInventory(tornado.web.RequestHandler):
    def get(self):
        send = dict()
        slots = dict()
        equipped = dict()
        for item in inventory.find():
            slots[item['_id']] = item
        for item in hero.find():
            equipped[item['_id']] = item

        send['inventory'] = slots
        send['equipped'] = equipped
        self.write(send)


class backUp(tornado.web.RequestHandler):
    def get(self):
        add = [

            {'_id': 1, 'item': 'diamond-helmet', 'type': 'head'},
            {'_id': 2, 'item': 'diamond-torso', 'type': 'torso'},
            {'_id': 3, 'item': 'diamond-legs', 'type': 'legs'},
            {'_id': 4, 'item': 'diamond-foots', 'type': 'head'},
            {'_id': 5, 'item': 'sun-glasses', 'type': 'glass'},

            {'_id': 6, 'item': 'chainmail-helmet', 'type': 'head'},
            {'_id': 7, 'item': 'chainmail-torso', 'type': 'torso'},
            {'_id': 8, 'item': 'chainmail-legs', 'type': 'legs'},
            {'_id': 9, 'item': 'chainmail-foots', 'type': 'foots'},
            {'_id': 10, 'item': 'kaspersky-shield', 'type': 'shield'},

            {'_id': 11, 'item': 'leather-helmet', 'type': 'head'},
            {'_id': 12, 'item': 'leather-torso', 'type': 'torso'},
            {'_id': 13, 'item': 'leather-legs', 'type': 'legs'},
            {'_id': 14, 'item': 'leather-foots', 'type': 'foots'},
            {'_id': 15, 'item': 'mars-shield', 'type': 'shield'},

            {'_id': 16, 'item': 'nearcrowd-helmet', 'type': 'head'},
            {'_id': 17, 'item': 'nearcrowd-torso', 'type': 'torso'},
            {'_id': 18, 'item': 'nearcrowd-legs', 'type': 'legs'},
            {'_id': 19, 'item': 'nearcrowd-foots', 'type': 'foots'},
            {'_id': 20, 'item': 'bitcoin-necklace', 'type': 'necklace'},

            {'_id': 21, 'item': 'gold-necklace', 'type': 'necklace'},
            {'_id': 22, 'item': 'dollar-necklace', 'type': 'necklace'}

        ]
        inventory.drop()
        hero.drop()
        inventory.insert_many(add)
        self.write('Successful')


class swapValid(tornado.web.RequestHandler):
    def post(self):
        x = self.request.body
        data = json.loads(x)
        items = dict()
        equipped_items = dict()
        item = data['item']
        take = data['take']
        put = data['put']
        response = {'status': 'ok'}
        #Положить в активный слот
        if take == put or (take == 'necklace' and (put == 'necklace1' or put == 'necklace2')):
            res = inventory.find_one({'item': item, 'type': take})
            if res is None:
                response['status'] = 'The element is not in the inventory'
            else:
                inventory.delete_one(res)
                if put == 'necklace1' or put == 'necklace2':
                    res['place'] = put[8]
                else:
                    res['place'] = ''
                hero.insert_one(res)
                for item in inventory.find():
                    items[item['_id']] = item
                for item in hero.find():
                    equipped_items[item['_id']] = item
                response['equipped_items'] = equipped_items
                response['items'] = items
        #Положить в инвентарь
        elif put == 'inventory':
            print(item, take, put)
            del_item = hero.find_one({'item': item, 'type': take})
            if 'necklace' in take:
                place = take[8]
                take = take[:-1]
                del_item = hero.find_one({'item': item, 'type': take, 'place': place})
                print(del_item)
            if del_item is None:
                response['status'] = 'The element is not equipped on hero'
            else:

                inventory.insert_one(del_item)
                hero.delete_one(del_item)
                for item in inventory.find():
                    items[item['_id']] = item
                for item in hero.find():
                    equipped_items[item['_id']] = item
                response['equipped_items'] = equipped_items
                response['items'] = items
        elif 'necklace' in take and 'necklace' in put and ((take == 'necklace1' and put == 'necklace2') or (take == 'necklace2' and put == 'necklace1')):
            print(item, take, put)
            _type = take[:-1]
            place = take[8]
            take_item = hero.find_one({'item': item, 'type': _type, 'place': place})
            __type = put[:-1]
            _place = put[8]
            put_item = hero.find_one({'type': __type, 'place': _place})
            if not ((put_item is None) or (take_item is None)):
                print(take_item, put_item)
                upgrade = {"$set": {"place": _place}}
                hero.update_one(take_item, upgrade)
                upgrade = {"$set": {"place": place}}
                hero.update_one(put_item, upgrade)
                print(take_item, put_item)
                for item in inventory.find():
                    items[item['_id']] = item
                for item in hero.find():
                    equipped_items[item['_id']] = item
                response['equipped_items'] = equipped_items
                response['items'] = items
            else:
                response['status'] = 'All bad'
        self.write(response)


if __name__ == '__main__':
    app = tornado.web.Application([
        (r"/", mainpage),
        (r"/game.js", gamejs),
        (r"/takeInventory", takeInventory),
        (r"/swapItemsValidation", swapValid),
        (r"/backUp", backUp),
        (r'/fonts/(.*)', tornado.web.StaticFileHandler, {'path': './fonts'}),
        (r'/img/(.*)', tornado.web.StaticFileHandler, {'path': './img'}),
        (r'/css/(.*)', tornado.web.StaticFileHandler, {'path': './css'}),
    ])

    app.listen(3333)
    print("localhost:3333/")
    tornado.ioloop.IOLoop.current().start()
