import { ModelRouter } from '../commons/router.model'
import * as restify from 'restify';
import { Restaurant } from './restaurants.model'
import { NotFoundError } from 'restify-errors';
import { authorize } from '../security/authz.handler';

class RestaurantsRouter extends ModelRouter<Restaurant> {

    constructor() {
        super(Restaurant)
    }

    envelope(document){
        let resource = super.envelope(document)
        resource._links.menu = `${this.basePath}/${resource._id}/menu`
        return resource
    }

    findMenu = (req, resp, next) => {
        Restaurant.findById(req.params.id, "+menu")
            .then(rest => {
                if (!rest) {
                    throw new NotFoundError('Restaurant not found!')
                } else {
                    resp.json(rest.menu)
                    return next()
                }
            }).catch(next)
    }

    replaceMenu = (req, resp, next) => {
        Restaurant.findById(req.params.id)
            .then(rest => {
                if (!rest) {
                    throw new NotFoundError('Restaurant not found!')
                } else {
                    if (Array.isArray(req.body)) rest.menu = req.body
                    return rest.save()
                }
            })
            .then(rest => {
                resp.json(rest.menu)
                return next()
            })
            .catch(next)
    }

    applyRoutes(application: restify.Server) {
        application.get(`${this.basePath}`, this.findAll)
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu])
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
        application.put(`${this.basePath}/:id/menu`, [authorize('admin'), this.validateId, this.replaceMenu])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'),this.validateId, this.delete])
    }
}

export const restaurantsRouter = new RestaurantsRouter