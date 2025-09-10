import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default class token {

    static signToken(name: string, email: string, id: string) {
        try {
            const secret = process.env.JWT_SECRET;

            if (!secret) {
                return {
                    success: false,
                    cause: 'JWT secret not found',
                    data: null,
                };
            }

            const jwtPayload = {
                id: id,
                name: name,
                email: email,
            };

            const token = 'Bearer' + jwt.sign(jwtPayload, secret);
            return {
                success: true,
                cause: 'JWT token signed',
                data: token,
            };
        } catch (err) {
            console.error('Error in signing token', err);
            return {
                success: false,
                cause: 'JWT token sign failed',
                data: null,
            };
        }
    }

    static verifyToken(req: Request, res: Response, next: NextFunction) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return {
                success: false,
                cause: 'JWT secret not found',
                data: null,
            };
        };

        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer')) {
                res.status(401).json ({
                    message: 'Unauthorized',
                });
                return;
            };

            const token = authHeader.split(" ")[1];

            if (!token) {
                res.status(401).json({
                    message: 'Token not found',
                });
                return;
            }

            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    res.status(401).json({
                        message: 'You are not authorized',
                    });
                    return;
                };
                req.user = decoded as AuthUser;
                next();
            });
        } catch (err) {
            console.error('Error in validating token', err);
            res.status(500).json({
                message: 'Internal server error', 
            });
            return;
        }

    }
}