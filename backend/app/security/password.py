from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


def verify_password(password, hash_):
    return bcrypt.check_password_hash(hash_, password)


def hash_password(password):
    return bcrypt.generate_password_hash(password).decode()
